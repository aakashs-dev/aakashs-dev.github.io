import { TestBed } from '@angular/core/testing';
import {
  TelemetryService,
  classifyViewport,
  extractReferrerHost,
  isLocalHost,
} from './telemetry.service';

describe('Telemetry pure helpers', () => {
  it('classifies coarse viewport buckets without fingerprinting exact widths', () => {
    expect(classifyViewport(320)).toBe('mobile');
    expect(classifyViewport(639)).toBe('mobile');
    expect(classifyViewport(640)).toBe('tablet');
    expect(classifyViewport(1023)).toBe('tablet');
    expect(classifyViewport(1024)).toBe('desktop');
    expect(classifyViewport(1599)).toBe('desktop');
    expect(classifyViewport(1600)).toBe('ultrawide');
    expect(classifyViewport(2560)).toBe('ultrawide');
  });

  it('extracts only external referrer hostnames and strips paths/queries', () => {
    expect(extractReferrerHost('https://www.linkedin.com/feed/update/123?token=secret', 'aakashs-dev.github.io')).toBe(
      'www.linkedin.com',
    );
    expect(extractReferrerHost('https://aakashs-dev.github.io/#portfolio', 'aakashs-dev.github.io')).toBeNull();
    expect(extractReferrerHost('', 'aakashs-dev.github.io')).toBeNull();
    expect(extractReferrerHost('not-a-url', 'aakashs-dev.github.io')).toBeNull();
  });

  it('detects localhost and loopback addresses', () => {
    expect(isLocalHost('localhost')).toBe(true);
    expect(isLocalHost('127.0.0.1')).toBe(true);
    expect(isLocalHost('aakashs-dev.github.io')).toBe(false);
  });
});

describe('TelemetryService', () => {
  const originalSendBeacon = navigator.sendBeacon;
  const originalFetch = window.fetch;

  afterEach(() => {
    Object.defineProperty(navigator, 'sendBeacon', {
      value: originalSendBeacon,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window, 'fetch', {
      value: originalFetch,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(navigator, 'globalPrivacyControl', {
      value: undefined,
      configurable: true,
      writable: true,
    });
  });

  it('sends initial page_view via sendBeacon and flushes tracked events when hidden', () => {
    const calls: { url: string; body: unknown }[] = [];
    Object.defineProperty(navigator, 'sendBeacon', {
      value: (url: string, data: unknown) => {
        calls.push({ url, body: data });
        return true;
      },
      configurable: true,
      writable: true,
    });

    const service = TestBed.inject(TelemetryService);
    service.init('https://example.workers.dev/v1/events', true);

    expect(calls.length).toBe(1);
    expect(calls[0].url).toBe('https://example.workers.dev/v1/events');
    expect(typeof calls[0].body).toBe('string');
    expect(JSON.parse(calls[0].body as string).events[0].type).toBe('page_view');

    service.track('dossier_open', 'the-numbers-game');
    service.track('section_view', 'portfolio');
    service.flush();
    expect(calls.length).toBe(2);
  });

  it('falls back to credential-less CORS-safelisted fetch when sendBeacon declines', () => {
    Object.defineProperty(navigator, 'sendBeacon', {
      value: () => false,
      configurable: true,
      writable: true,
    });

    const fetchCalls: { url: string; init: RequestInit | undefined }[] = [];
    Object.defineProperty(window, 'fetch', {
      value: (url: string, init?: RequestInit) => {
        fetchCalls.push({ url, init });
        return Promise.resolve(new Response(null, { status: 204 }));
      },
      configurable: true,
      writable: true,
    });

    const service = TestBed.inject(TelemetryService);
    service.init('https://example.workers.dev/v1/events', true);

    expect(fetchCalls.length).toBe(1);
    expect(fetchCalls[0].url).toBe('https://example.workers.dev/v1/events');
    const init = fetchCalls[0].init!;
    expect(typeof init.body).toBe('string');
    expect(init.credentials).toBe('omit');
    expect(init.keepalive).toBe(true);
    expect(init.mode).toBe('cors');
    expect(init.headers).toBeUndefined();
  });

  it('stays silent when Global Privacy Control is enabled', () => {
    const calls: unknown[] = [];
    Object.defineProperty(navigator, 'globalPrivacyControl', {
      value: true,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(navigator, 'sendBeacon', {
      value: (url: string) => {
        calls.push(url);
        return true;
      },
      configurable: true,
      writable: true,
    });

    const service = TestBed.inject(TelemetryService);
    service.init('https://example.workers.dev/collect', true);
    service.track('dossier_open', 'mailshield');
    service.flush();

    expect(calls.length).toBe(0);
  });
});
