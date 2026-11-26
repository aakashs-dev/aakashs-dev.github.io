import { TestBed } from '@angular/core/testing';
import { PROFILE } from '../../profile';
import { ThemeService } from '../../services/theme.service';
import { Sidenav } from './sidenav';

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

  it('uses numbered section anchor hrefs and marks the active section with aria-current', async () => {
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
    expect(primaryLinks.map((a) => a.querySelector('.nav-index')?.textContent?.trim())).toEqual([
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
    ]);
    expect(primaryLinks[0].getAttribute('aria-current')).toBe('location');
    expect(primaryLinks[1].getAttribute('aria-current')).toBeNull();
  });

  it('exposes quick-connect Email and LinkedIn links in the sidebar footer', async () => {
    const fixture = TestBed.createComponent(Sidenav);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const emailLink = el.querySelector('.sidenav a[aria-label="Email Aakash Sharma"]');
    const linkedinLink = el.querySelector('.sidenav a[aria-label="LinkedIn profile"]');
    expect(emailLink?.getAttribute('href')).toBe(`mailto:${PROFILE.email}`);
    expect(linkedinLink?.getAttribute('href')).toBe(PROFILE.linkedinUrl);
  });

  it('opens and closes the native dialog drawer and syncs aria-expanded', async () => {
    const fixture = TestBed.createComponent(Sidenav);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const menuBtn = el.querySelector('button[aria-controls="mobile-nav-drawer"]') as HTMLButtonElement;
    const dialog = el.querySelector('#mobile-nav-drawer') as HTMLDialogElement;
    expect(el.querySelector('.mobile-header')?.firstElementChild).toBe(menuBtn);
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

    const toggleBtn = el.querySelector('.sidenav .scheme-btn') as HTMLButtonElement;
    expect(theme.resolvedColorScheme()).toBe('light');
    toggleBtn.click();
    await fixture.whenStable();
    expect(theme.resolvedColorScheme()).toBe('dark');
  });

  it('keeps the clicked nav item highlighted without flickering through intermediate sections during smooth scroll', async () => {
    const callbacks: IntersectionObserverCallback[] = [];
    const OriginalIO = globalThis.IntersectionObserver;
    globalThis.IntersectionObserver = class {
      constructor(cb: IntersectionObserverCallback) {
        callbacks.push(cb);
      }
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords() {
        return [];
      }
      root = null;
      rootMargin = '';
      thresholds = [];
    } as unknown as typeof IntersectionObserver;

    const contactEl = document.createElement('section');
    contactEl.id = 'contact';
    contactEl.scrollIntoView = () => {};
    document.body.appendChild(contactEl);

    try {
      const fixture = TestBed.createComponent(Sidenav);
      await fixture.whenStable();
      await new Promise((r) => setTimeout(r, 300));
      expect(callbacks.length).toBe(1);

      const contactLink = (fixture.nativeElement as HTMLElement).querySelector(
        'nav[aria-label="Primary"] a[href="#contact"]',
      ) as HTMLAnchorElement;
      contactLink.click();
      await fixture.whenStable();
      expect(fixture.componentInstance.activeSection()).toBe('contact');

      // Intermediate sections passing through the viewport during smooth scroll must be ignored
      const aboutEl = document.createElement('section');
      aboutEl.id = 'about';
      callbacks[0](
        [{ isIntersecting: true, target: aboutEl } as unknown as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
      expect(fixture.componentInstance.activeSection()).toBe('contact');

      // Once scrollend fires, manual scroll observation resumes
      window.dispatchEvent(new Event('scrollend'));
      callbacks[0](
        [{ isIntersecting: true, target: aboutEl } as unknown as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
      expect(fixture.componentInstance.activeSection()).toBe('about');
    } finally {
      contactEl.remove();
      globalThis.IntersectionObserver = OriginalIO;
    }
  });
});
