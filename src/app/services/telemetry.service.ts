import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { TELEMETRY_CONFIG } from '../telemetry.config';

export type ViewportClass = 'mobile' | 'tablet' | 'desktop' | 'ultrawide';
export type TelemetryEventType = 'page_view' | 'section_view' | 'dossier_open' | 'web_vital';

export interface TelemetryEvent {
  readonly type: TelemetryEventType;
  readonly ts: string;
  readonly path: string;
  readonly target?: string;
  readonly value?: number;
  readonly viewport?: ViewportClass;
  readonly referrerHost?: string | null;
  readonly colorScheme?: 'light' | 'dark';
  readonly tz?: string;
}

export function classifyViewport(width: number): ViewportClass {
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  if (width < 1600) return 'desktop';
  return 'ultrawide';
}

export function extractReferrerHost(referrer: string, ownHost: string): string | null {
  if (!referrer) return null;
  try {
    const parsed = new URL(referrer);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    if (parsed.hostname.toLowerCase() === ownHost.toLowerCase()) return null;
    return parsed.hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function isLocalHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || h === '::1' || h.endsWith('.local');
}

@Injectable({ providedIn: 'root' })
export class TelemetryService implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private endpoint = TELEMETRY_CONFIG.endpoint;
  private enabled = false;
  private sentCount = 0;
  private buffer: TelemetryEvent[] = [];
  private lcpValue: number | null = null;
  private clsValue = 0;
  private observers: PerformanceObserver[] = [];

  private readonly onVisibilityChange = () => {
    if (this.document.visibilityState === 'hidden') {
      this.recordVitals();
      this.flush();
    }
  };

  init(endpointOverride?: string, allowLocal = false): void {
    if (!this.isBrowser) return;

    const targetEndpoint = (endpointOverride ?? this.endpoint).trim();
    if (!targetEndpoint) return;

    const view = this.document.defaultView;
    if (!view) return;

    const nav = view.navigator as Navigator & { globalPrivacyControl?: boolean };
    if (nav?.globalPrivacyControl === true) return;
    if (!allowLocal && isLocalHost(view.location.hostname)) return;

    this.endpoint = targetEndpoint;
    this.enabled = true;

    const prefersDark =
      typeof view.matchMedia === 'function' && view.matchMedia('(prefers-color-scheme: dark)').matches;
    const metaScheme = this.document.querySelector('meta[name="color-scheme"]')?.getAttribute('content');
    const colorScheme: 'light' | 'dark' =
      metaScheme === 'dark' ? 'dark' : metaScheme === 'light' ? 'light' : prefersDark ? 'dark' : 'light';

    let tz: string | undefined;
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      tz = undefined;
    }

    this.enqueue({
      type: 'page_view',
      ts: new Date().toISOString(),
      path: view.location.pathname || '/',
      viewport: classifyViewport(view.innerWidth),
      referrerHost: extractReferrerHost(this.document.referrer, view.location.hostname),
      colorScheme,
      tz,
    });
    this.flush();

    this.document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.observeWebVitals();
  }

  track(type: Exclude<TelemetryEventType, 'page_view'>, target: string, value?: number): void {
    if (!this.enabled || !this.isBrowser) return;
    const path = this.document.defaultView?.location.pathname || '/';
    this.enqueue({
      type,
      ts: new Date().toISOString(),
      path,
      target,
      ...(value !== undefined ? { value } : {}),
    });
  }

  flush(): void {
    if (!this.enabled || !this.isBrowser || this.buffer.length === 0) return;

    const batch = this.buffer.splice(0);
    const body = JSON.stringify({ events: batch });
    const view = this.document.defaultView;

    try {
      if (typeof view?.navigator?.sendBeacon === 'function') {
        const blob = new Blob([body], { type: 'application/json' });
        const queued = view.navigator.sendBeacon(this.endpoint, blob);
        if (queued) return;
      }
      if (typeof view?.fetch === 'function') {
        void view
          .fetch(this.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: true,
            mode: 'cors',
          })
          .catch(() => {});
      }
    } catch {
      // Telemetry is strictly fail-silent.
    }
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    this.document.removeEventListener('visibilitychange', this.onVisibilityChange);
    for (const obs of this.observers) {
      obs.disconnect();
    }
    this.observers = [];
  }

  private enqueue(event: TelemetryEvent): void {
    if (this.sentCount >= TELEMETRY_CONFIG.maxEventsPerSession) return;
    this.sentCount++;
    this.buffer.push(event);
  }

  private recordVitals(): void {
    if (this.lcpValue !== null) {
      this.enqueue({
        type: 'web_vital',
        ts: new Date().toISOString(),
        path: this.document.defaultView?.location.pathname || '/',
        target: 'LCP',
        value: Math.round(this.lcpValue),
      });
      this.lcpValue = null;
    }
    if (this.clsValue > 0) {
      this.enqueue({
        type: 'web_vital',
        ts: new Date().toISOString(),
        path: this.document.defaultView?.location.pathname || '/',
        target: 'CLS',
        value: Number(this.clsValue.toFixed(4)),
      });
      this.clsValue = 0;
    }
  }

  private observeWebVitals(): void {
    if (typeof PerformanceObserver === 'undefined') return;
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const last = list.getEntries().at(-1);
        if (last) this.lcpValue = last.startTime;
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(lcpObserver);
    } catch {
      // Unsupported entryType
    }

    try {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & { hadRecentInput?: boolean; value?: number })[]) {
          if (!entry.hadRecentInput && typeof entry.value === 'number') {
            this.clsValue += entry.value;
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(clsObserver);
    } catch {
      // Unsupported entryType
    }
  }
}
