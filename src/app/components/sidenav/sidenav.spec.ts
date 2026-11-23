import { TestBed } from '@angular/core/testing';
import { Sidenav } from './sidenav';
import { ThemeService } from '../../services/theme.service';

describe('Sidenav', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Sidenav],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('uses real section anchor hrefs and marks the active section with aria-current', async () => {
    const fixture = TestBed.createComponent(Sidenav);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const primaryLinks = Array.from(el.querySelectorAll('nav[aria-label="Primary"] a.nav-item'));
    expect(primaryLinks.map((a) => a.getAttribute('href'))).toEqual([
      '#home',
      '#about',
      '#resume',
      '#portfolio',
      '#certifications',
      '#contact',
    ]);
    expect(primaryLinks[0].getAttribute('aria-current')).toBe('location');
    expect(primaryLinks[1].getAttribute('aria-current')).toBeNull();
  });

  it('opens and closes the native dialog drawer and syncs aria-expanded', async () => {
    const fixture = TestBed.createComponent(Sidenav);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const menuBtn = el.querySelector('button[aria-controls="mobile-nav-drawer"]') as HTMLButtonElement;
    const dialog = el.querySelector('#mobile-nav-drawer') as HTMLDialogElement;
    expect(menuBtn.getAttribute('aria-expanded')).toBe('false');

    menuBtn.click();
    await fixture.whenStable();
    expect(dialog.hasAttribute('open')).toBe(true);
    expect(menuBtn.getAttribute('aria-expanded')).toBe('true');

    const closeBtn = dialog.querySelector('button[aria-label="Close menu"]') as HTMLButtonElement;
    closeBtn.click();
    await fixture.whenStable();
    expect(dialog.hasAttribute('open')).toBe(false);
    expect(menuBtn.getAttribute('aria-expanded')).toBe('false');
  });

  it('hides the season selector while seasonal themes are disabled and toggles light/dark theme', async () => {
    const fixture = TestBed.createComponent(Sidenav);
    const theme = TestBed.inject(ThemeService);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('#desktop-season-select')).toBeNull();

    const toggleBtn = el.querySelector('.scheme-btn') as HTMLButtonElement;
    expect(theme.resolvedColorScheme()).toBe('light');
    toggleBtn.click();
    await fixture.whenStable();
    expect(theme.resolvedColorScheme()).toBe('dark');
  });
});
