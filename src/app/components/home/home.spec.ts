import { TestBed } from '@angular/core/testing';
import { Home } from './home';

describe('Home', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('renders a single h1 before any h2 in document order', async () => {
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
  });

  it('renders static role copy without a blinking cursor when prefers-reduced-motion is enabled', async () => {
    window.matchMedia = ((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;

    await TestBed.configureTestingModule({
      imports: [Home],
    }).compileComponents();

    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.typewriter-text')?.textContent?.trim()).toBe(
      'Data Analyst & Software Engineer',
    );
    expect(el.querySelector('.cursor')).toBeNull();
  });
});
