import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';

export type ColorSchemePreference = 'system' | 'light' | 'dark';
export type ResolvedColorScheme = 'light' | 'dark';
export type SeasonId =
  | 'summer'
  | 'autumn'
  | 'winter'
  | 'spring'
  | 'new-year'
  | 'diwali'
  | 'halloween'
  | 'christmas';
export type SeasonSelection = 'auto' | SeasonId;

export interface SeasonOption {
  readonly id: SeasonId;
  readonly label: string;
  readonly kind: 'season' | 'holiday';
}

export const SEASON_OPTIONS: readonly SeasonOption[] = [
  { id: 'summer', label: 'Summer', kind: 'season' },
  { id: 'autumn', label: 'Autumn', kind: 'season' },
  { id: 'winter', label: 'Winter', kind: 'season' },
  { id: 'spring', label: 'Spring', kind: 'season' },
  { id: 'new-year', label: 'New Year', kind: 'holiday' },
  { id: 'diwali', label: 'Diwali', kind: 'holiday' },
  { id: 'halloween', label: 'Halloween', kind: 'holiday' },
  { id: 'christmas', label: 'Christmas', kind: 'holiday' },
];

const COLOR_SCHEME_KEY = 'portfolio-color-scheme';
const SEASON_KEY = 'portfolio-season';

/**
 * Only the default sepia (autumn) light/dark theme is active for now.
 * Flip to true once the seasonal and holiday palettes are fleshed out.
 */
export const SEASONAL_THEMES_ENABLED = false;

/**
 * Main Diwali day (Lakshmi Puja / Amavasya, Melbourne local calendar) per year.
 * The holiday theme activates on [day - 1, day + 1].
 */
const DIWALI_DATES: Readonly<Record<number, readonly [month: number, day: number]>> = {
  2025: [10, 20],
  2026: [11, 8],
  2027: [10, 29],
  2028: [10, 17],
  2029: [11, 5],
  2030: [10, 26],
};

function isWithinDayWindow(date: Date, month: number, day: number, radiusDays: number): boolean {
  const target = new Date(date.getFullYear(), month - 1, day);
  const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.abs(Math.round((current.getTime() - target.getTime()) / 86_400_000));
  return diffDays <= radiusDays;
}

/**
 * Resolves the active seasonal or holiday theme for a local calendar date.
 * Holiday windows take precedence over Southern Hemisphere (Melbourne) seasons.
 */
export function resolveSeasonalTheme(date: Date): SeasonId {
  const month = date.getMonth() + 1; // 1..12
  const day = date.getDate();

  // Holiday windows
  if ((month === 12 && day === 31) || (month === 1 && day <= 2)) {
    return 'new-year';
  }
  if (month === 12 && day >= 24 && day <= 26) {
    return 'christmas';
  }
  const diwali = DIWALI_DATES[date.getFullYear()];
  if (diwali && isWithinDayWindow(date, diwali[0], diwali[1], 1)) {
    return 'diwali';
  }
  if (month === 10 && (day === 30 || day === 31)) {
    return 'halloween';
  }

  // Southern Hemisphere (Melbourne) meteorological seasons
  if (month === 12 || month <= 2) {
    return 'summer';
  }
  if (month <= 5) {
    return 'autumn';
  }
  if (month <= 8) {
    return 'winter';
  }
  return 'spring';
}

export function isSeasonId(value: string | null): value is SeasonId {
  return value !== null && SEASON_OPTIONS.some((o) => o.id === value);
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly systemDark = signal(false);
  readonly colorScheme = signal<ColorSchemePreference>('system');
  readonly seasonSelection = signal<SeasonSelection>('auto');

  readonly autoSeason: SeasonId = resolveSeasonalTheme(new Date());

  readonly resolvedColorScheme = computed<ResolvedColorScheme>(() => {
    const pref = this.colorScheme();
    if (pref === 'light' || pref === 'dark') {
      return pref;
    }
    return this.systemDark() ? 'dark' : 'light';
  });

  readonly activeSeason = computed<SeasonId>(() => {
    if (!SEASONAL_THEMES_ENABLED) {
      return 'autumn';
    }
    const sel = this.seasonSelection();
    return sel === 'auto' ? this.autoSeason : sel;
  });

  readonly activeSeasonLabel = computed(() => {
    const id = this.activeSeason();
    return SEASON_OPTIONS.find((o) => o.id === id)?.label ?? 'Autumn';
  });

  constructor() {
    if (this.isBrowser) {
      const view = this.document.defaultView;
      const mql = typeof view?.matchMedia === 'function' ? view.matchMedia('(prefers-color-scheme: dark)') : null;
      if (mql) {
        this.systemDark.set(mql.matches);
        mql.addEventListener('change', (e) => this.systemDark.set(e.matches));
      }

      this.syncFromStorage();
      view?.addEventListener('storage', (event) => {
        if (event.key === COLOR_SCHEME_KEY || event.key === SEASON_KEY) {
          this.syncFromStorage();
        }
      });
    }

    effect(() => {
      this.applyColorSchemeMeta(this.colorScheme());
    });

    effect(() => {
      this.applySeasonAttribute(this.activeSeason());
    });
  }

  /**
   * Two-state comfort toggle: switches to the opposite of the currently rendered scheme.
   * If that target matches the OS preference, clears the override so the site follows
   * the system again instead of invisibly pinning it.
   */
  toggleColorScheme(): void {
    const target: ResolvedColorScheme = this.resolvedColorScheme() === 'dark' ? 'light' : 'dark';
    const systemScheme: ResolvedColorScheme = this.systemDark() ? 'dark' : 'light';
    const next: ColorSchemePreference = target === systemScheme ? 'system' : target;
    this.setColorScheme(next);
  }

  setColorScheme(pref: ColorSchemePreference): void {
    this.colorScheme.set(pref);
    this.writeStorage(COLOR_SCHEME_KEY, pref === 'system' ? null : pref);
  }

  setSeasonSelection(selection: SeasonSelection): void {
    this.seasonSelection.set(selection);
    this.writeStorage(SEASON_KEY, selection === 'auto' ? null : selection);
  }

  private syncFromStorage(): void {
    const storedScheme = this.readStorage(COLOR_SCHEME_KEY);
    if (storedScheme === 'light' || storedScheme === 'dark') {
      this.colorScheme.set(storedScheme);
    } else {
      this.colorScheme.set('system');
    }

    const storedSeason = this.readStorage(SEASON_KEY);
    if (isSeasonId(storedSeason)) {
      this.seasonSelection.set(storedSeason);
    } else {
      this.seasonSelection.set('auto');
    }
  }

  private applyColorSchemeMeta(pref: ColorSchemePreference): void {
    if (!this.isBrowser) return;
    const content = pref === 'system' ? 'light dark' : pref;
    let meta = this.document.querySelector('meta[name="color-scheme"]');
    if (!meta) {
      meta = this.document.createElement('meta');
      meta.setAttribute('name', 'color-scheme');
      this.document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }

  private applySeasonAttribute(season: SeasonId): void {
    if (!this.isBrowser) return;
    if (!SEASONAL_THEMES_ENABLED) {
      delete this.document.documentElement.dataset['season'];
      return;
    }
    this.document.documentElement.dataset['season'] = season;
  }

  private readStorage(key: string): string | null {
    try {
      return this.document.defaultView?.localStorage.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  private writeStorage(key: string, value: string | null): void {
    if (!this.isBrowser) return;
    try {
      const storage = this.document.defaultView?.localStorage;
      if (!storage) return;
      if (value === null) {
        storage.removeItem(key);
      } else {
        storage.setItem(key, value);
      }
    } catch {
      // Storage blocked (e.g., private browsing); theme still applies for the session.
    }
  }
}
