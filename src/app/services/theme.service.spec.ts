import { TestBed } from '@angular/core/testing';
import { ThemeService, resolveSeasonalTheme } from './theme.service';

describe('resolveSeasonalTheme', () => {
  it('resolves Southern Hemisphere (Melbourne) seasons across the year', () => {
    expect(resolveSeasonalTheme(new Date(2026, 0, 15))).toBe('summer'); // Jan 15
    expect(resolveSeasonalTheme(new Date(2028, 1, 29))).toBe('summer'); // Feb 29 (leap day)
    expect(resolveSeasonalTheme(new Date(2026, 2, 1))).toBe('autumn');  // Mar 1
    expect(resolveSeasonalTheme(new Date(2026, 4, 31))).toBe('autumn'); // May 31
    expect(resolveSeasonalTheme(new Date(2026, 5, 1))).toBe('winter');  // Jun 1
    expect(resolveSeasonalTheme(new Date(2026, 7, 31))).toBe('winter'); // Aug 31
    expect(resolveSeasonalTheme(new Date(2026, 8, 1))).toBe('spring');  // Sep 1
    expect(resolveSeasonalTheme(new Date(2026, 10, 24))).toBe('spring'); // Nov 24
    expect(resolveSeasonalTheme(new Date(2026, 11, 10))).toBe('summer'); // Dec 10
  });

  it('activates holiday themes on exact date windows', () => {
    // New Year window: Dec 31 – Jan 2
    expect(resolveSeasonalTheme(new Date(2026, 11, 31))).toBe('new-year');
    expect(resolveSeasonalTheme(new Date(2027, 0, 1))).toBe('new-year');
    expect(resolveSeasonalTheme(new Date(2027, 0, 2))).toBe('new-year');
    expect(resolveSeasonalTheme(new Date(2027, 0, 3))).toBe('summer');

    // Christmas window: Dec 24 – Dec 26
    expect(resolveSeasonalTheme(new Date(2026, 11, 23))).toBe('summer');
    expect(resolveSeasonalTheme(new Date(2026, 11, 24))).toBe('christmas');
    expect(resolveSeasonalTheme(new Date(2026, 11, 25))).toBe('christmas');
    expect(resolveSeasonalTheme(new Date(2026, 11, 26))).toBe('christmas');
    expect(resolveSeasonalTheme(new Date(2026, 11, 27))).toBe('summer');

    // Halloween window: Oct 30 – Oct 31
    expect(resolveSeasonalTheme(new Date(2026, 9, 29))).toBe('spring');
    expect(resolveSeasonalTheme(new Date(2026, 9, 30))).toBe('halloween');
    expect(resolveSeasonalTheme(new Date(2026, 9, 31))).toBe('halloween');
    expect(resolveSeasonalTheme(new Date(2026, 10, 1))).toBe('spring');

    // Diwali window (±1 day around 2026-11-08)
    expect(resolveSeasonalTheme(new Date(2026, 10, 6))).toBe('spring');
    expect(resolveSeasonalTheme(new Date(2026, 10, 7))).toBe('diwali');
    expect(resolveSeasonalTheme(new Date(2026, 10, 8))).toBe('diwali');
    expect(resolveSeasonalTheme(new Date(2026, 10, 9))).toBe('diwali');
    expect(resolveSeasonalTheme(new Date(2026, 10, 10))).toBe('spring');
  });
});

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.head.querySelector('meta[name="color-scheme"]')?.remove();
    delete document.documentElement.dataset['season'];
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('defaults to system color scheme and sepia (autumn) palette while seasonal themes are hidden', () => {
    const service = TestBed.inject(ThemeService);
    TestBed.flushEffects();

    expect(service.colorScheme()).toBe('system');
    expect(service.activeSeason()).toBe('autumn');
    expect(document.head.querySelector('meta[name="color-scheme"]')?.getAttribute('content')).toBe('light dark');
    expect(document.documentElement.dataset['season']).toBeUndefined();
  });

  it('toggles between override and system without pinning back to system', () => {
    const service = TestBed.inject(ThemeService);
    TestBed.flushEffects();

    // jsdom defaults matchMedia prefers-color-scheme: dark to false (light)
    expect(service.resolvedColorScheme()).toBe('light');

    // First toggle overrides to dark and stores it
    service.toggleColorScheme();
    TestBed.flushEffects();
    expect(service.colorScheme()).toBe('dark');
    expect(localStorage.getItem('portfolio-color-scheme')).toBe('dark');
    expect(document.head.querySelector('meta[name="color-scheme"]')?.getAttribute('content')).toBe('dark');

    // Second toggle matches system (light), so it reverts to 'system' and clears storage
    service.toggleColorScheme();
    TestBed.flushEffects();
    expect(service.colorScheme()).toBe('system');
    expect(localStorage.getItem('portfolio-color-scheme')).toBeNull();
    expect(document.head.querySelector('meta[name="color-scheme"]')?.getAttribute('content')).toBe('light dark');
  });

  it('keeps sepia active when seasonal themes are disabled while storing preference', () => {
    const service = TestBed.inject(ThemeService);
    service.setSeasonSelection('diwali');
    TestBed.flushEffects();

    expect(service.activeSeason()).toBe('autumn');
    expect(document.documentElement.dataset['season']).toBeUndefined();
    expect(localStorage.getItem('portfolio-season')).toBe('diwali');
  });
});
