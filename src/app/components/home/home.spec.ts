import { TestBed } from '@angular/core/testing';
import { Home } from './home';
import { buildPixelTextPath } from './pixel-blimp/pixel-font';
import {
  resolveMelbourneSeason,
  resolveSkylineHoliday,
  resolveSkylineScene,
} from './pixel-skyline/skyline-overlays';

describe('Home', () => {
  it('renders a single h1 before any h2 in document order with static role titles', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
    }).compileComponents();

    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const headings = Array.from(el.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    expect(el.querySelectorAll('h1').length).toBe(1);
    expect(headings[0].tagName).toBe('H1');
    expect(headings[0].textContent?.trim()).toBe('Aakash Sharma');
    expect(el.querySelector('.hero-subtitle')?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'Data Analyst | Software Engineer',
    );
  });

  it('renders the decorative crisp-pixel Melbourne skyline SVG background', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
    }).compileComponents();

    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const svg = el.querySelector<SVGSVGElement>('app-pixel-skyline svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('shape-rendering')).toBe('crispEdges');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 240 135');
    expect(svg?.querySelector('.day-celestial')).not.toBeNull();
    expect(svg?.querySelector('.night-celestial')).not.toBeNull();
    expect(svg?.querySelector('.skyline-near')).not.toBeNull();
    expect(svg?.querySelector('.civic-plaza')).not.toBeNull();
    expect(svg?.querySelector('.fed-screen')).not.toBeNull();
    expect(svg?.querySelector('.street-lamps')).not.toBeNull();
    expect(svg?.querySelector('.sky-birds')).not.toBeNull();
    expect(svg?.querySelector('.pixel-humans')).not.toBeNull();
    expect(svg?.querySelector('.tram .tram-beam')).not.toBeNull();
    expect(el.querySelector('.hero-summary')).not.toBeNull();
    expect(el.querySelectorAll('.hero-actions .hero-btn').length).toBe(2);
  });

  it('resolves Melbourne seasons and festivals and lets visitors preview all 8 scenes', async () => {
    expect(resolveSkylineHoliday(new Date(2026, 10, 26))).toBe('default');
    expect(resolveSkylineHoliday(new Date(2026, 11, 1))).toBe('christmas');
    expect(resolveSkylineHoliday(new Date(2026, 11, 30))).toBe('christmas');
    expect(resolveSkylineHoliday(new Date(2026, 11, 31))).toBe('new-year');
    expect(resolveSkylineHoliday(new Date(2027, 0, 2))).toBe('new-year');
    expect(resolveSkylineHoliday(new Date(2027, 0, 3))).toBe('default');
    expect(resolveSkylineHoliday(new Date(2026, 10, 8))).toBe('diwali');
    expect(resolveSkylineHoliday(new Date(2026, 9, 31))).toBe('halloween');
    expect(resolveMelbourneSeason(new Date(2026, 0, 15))).toBe('summer');
    expect(resolveMelbourneSeason(new Date(2026, 3, 15))).toBe('autumn');
    expect(resolveMelbourneSeason(new Date(2026, 6, 15))).toBe('winter');
    expect(resolveMelbourneSeason(new Date(2026, 10, 26))).toBe('spring');
    expect(resolveSkylineScene(new Date(2027, 0, 3))).toBe('summer');
    expect(resolveSkylineScene(new Date(2026, 3, 15))).toBe('autumn');
    expect(resolveSkylineScene(new Date(2026, 6, 15))).toBe('winter');
    expect(resolveSkylineScene(new Date(2026, 10, 26))).toBe('spring');
    expect(resolveSkylineScene(new Date(2026, 11, 25))).toBe('christmas');
    expect(resolveSkylineScene(new Date(2027, 0, 1))).toBe('new-year');
    expect(resolveSkylineScene(new Date(2026, 10, 8))).toBe('diwali');
    expect(resolveSkylineScene(new Date(2026, 9, 31))).toBe('halloween');
    expect(buildPixelTextPath('HAPPY DIWALI', 5, 5).path).toContain('M5 5');

    await TestBed.configureTestingModule({
      imports: [Home],
    }).compileComponents();

    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const select = el.querySelector<HTMLSelectElement>('#skyline-scene')!;
    expect(select).not.toBeNull();

    for (const holiday of ['christmas', 'new-year', 'diwali', 'halloween'] as const) {
      select.value = holiday;
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect(el.querySelector(`.overlay-plaza.overlay-${holiday}`)).not.toBeNull();
      expect(el.querySelector(`.overlay-sky.overlay-${holiday}`)).not.toBeNull();
      expect(el.querySelector('.overlay-bridge')).not.toBeNull();
      expect(el.querySelector(`.blimp-banner[data-holiday="${holiday}"] svg.blimp-svg`)).not.toBeNull();
      expect(el.querySelector('.blimp-banner .banner-text')).not.toBeNull();
      expect(el.querySelector('.hero-weather')).toBeNull();
      if (holiday === 'christmas') {
        expect(el.querySelector('.blimp-banner .santa-craft')).not.toBeNull();
        expect(el.querySelector('.tree-night-glow')).not.toBeNull();
        expect(el.querySelector('.screen-night-glow')).not.toBeNull();
      }
      if (holiday === 'halloween') {
        expect(el.querySelector('.sky-birds')).toBeNull();
      }
      if (holiday === 'new-year') {
        expect(el.querySelector('.ny-balloons')).not.toBeNull();
      }
      if (holiday === 'diwali') {
        expect(el.querySelector('.blimp-banner .rocket-craft')).not.toBeNull();
      }
    }

    for (const season of ['summer', 'autumn', 'winter', 'spring'] as const) {
      select.value = season;
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect(el.querySelector(`.overlay-plaza.overlay-season-${season}`)).not.toBeNull();
      expect(el.querySelector(`.overlay-sky.overlay-season-${season}`)).not.toBeNull();
      expect(el.querySelector('.sky-birds')).not.toBeNull();
      expect(el.querySelector('.overlay-bridge')).toBeNull();
      expect(el.querySelector('.blimp-banner')).toBeNull();
      expect(el.querySelector(`.hero-weather.weather-${season}`)).not.toBeNull();
      if (season === 'summer') {
        expect(el.querySelector('.sun-beams')).not.toBeNull();
      }
      if (season === 'winter' || season === 'spring') {
        expect(el.querySelector('.cloud-main')).not.toBeNull();
      }
      if (season === 'spring') {
        expect(el.querySelector('.drop .drop-body')).not.toBeNull();
      }
    }
  });
});
