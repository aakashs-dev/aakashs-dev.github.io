import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { PROFILE } from '../../profile';
import { TelemetryService } from '../../services/telemetry.service';
import {
  SEASONAL_THEMES_ENABLED,
  SEASON_OPTIONS,
  SeasonSelection,
  ThemeService,
} from '../../services/theme.service';

interface NavItem {
  readonly index: string;
  readonly id: string;
  readonly label: string;
}

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.scss',
})
export class Sidenav implements AfterViewInit, OnDestroy {
  readonly theme = inject(ThemeService);
  private readonly telemetry = inject(TelemetryService);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly mobileDrawer = viewChild<ElementRef<HTMLDialogElement>>('mobileDrawer');

  readonly profile = PROFILE;
  readonly activeSection = signal('home');
  readonly drawerOpen = signal(false);

  readonly navItems: readonly NavItem[] = [
    { index: '01', id: 'home', label: 'Home' },
    { index: '02', id: 'about', label: 'About' },
    { index: '03', id: 'resume', label: 'Resume' },
    { index: '04', id: 'portfolio', label: 'Portfolio' },
    { index: '05', id: 'certifications', label: 'Certifications' },
    { index: '06', id: 'contact', label: 'Contact' },
  ];

  readonly seasonalThemesEnabled = SEASONAL_THEMES_ENABLED;
  readonly seasonOptions = SEASON_OPTIONS.filter((o) => o.kind === 'season');
  readonly holidayOptions = SEASON_OPTIONS.filter((o) => o.kind === 'holiday');

  private observer: IntersectionObserver | null = null;
  private initTimer: ReturnType<typeof setTimeout> | null = null;
  private scrollLockTimer: ReturnType<typeof setTimeout> | null = null;
  private scrollLocked = false;
  private readonly releaseScrollLock = () => this.unlockScrollObserver();
  private readonly extendScrollLock = () => {
    if (!this.scrollLocked) return;
    if (this.scrollLockTimer !== null) clearTimeout(this.scrollLockTimer);
    this.scrollLockTimer = setTimeout(this.releaseScrollLock, 180);
  };

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.initTimer = setTimeout(() => {
      this.setupIntersectionObserver();
    }, 250);
  }

  ngOnDestroy(): void {
    if (this.initTimer !== null) {
      clearTimeout(this.initTimer);
      this.initTimer = null;
    }
    this.unlockScrollObserver();
    this.observer?.disconnect();
  }

  openDrawer(): void {
    const dialog = this.mobileDrawer()?.nativeElement;
    if (!dialog || dialog.open) return;
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    const dialog = this.mobileDrawer()?.nativeElement;
    if (!dialog || !dialog.open) {
      this.drawerOpen.set(false);
      return;
    }
    if (typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }
    this.drawerOpen.set(false);
  }

  onDrawerClick(event: MouseEvent): void {
    const dialog = this.mobileDrawer()?.nativeElement;
    if (dialog && event.target === dialog) {
      this.closeDrawer();
    }
  }

  onDrawerClose(): void {
    this.drawerOpen.set(false);
  }

  onSeasonChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as SeasonSelection;
    this.theme.setSeasonSelection(value);
  }

  scrollTo(sectionId: string, event: Event, fromDrawer = false): void {
    event.preventDefault();
    if (fromDrawer) {
      this.closeDrawer();
    }
    this.activeSection.set(sectionId);
    this.telemetry.track('section_view', sectionId);

    if (!this.isBrowser) return;
    const element = this.document.getElementById(sectionId);
    if (!element) return;

    const view = this.document.defaultView;
    const reduceMotion =
      typeof view?.matchMedia === 'function'
        ? view.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    if (!reduceMotion) {
      this.lockScrollObserver();
    }
    element.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  private lockScrollObserver(): void {
    this.unlockScrollObserver();
    this.scrollLocked = true;
    const view = this.document.defaultView;
    view?.addEventListener('scroll', this.extendScrollLock, { passive: true });
    view?.addEventListener('scrollend', this.releaseScrollLock, { once: true });
    view?.addEventListener('wheel', this.releaseScrollLock, { once: true, passive: true });
    view?.addEventListener('touchstart', this.releaseScrollLock, { once: true, passive: true });
    // Release cleanly if the target is already in view and emits no scroll events
    this.scrollLockTimer = setTimeout(this.releaseScrollLock, 400);
  }

  private unlockScrollObserver(): void {
    this.scrollLocked = false;
    if (this.scrollLockTimer !== null) {
      clearTimeout(this.scrollLockTimer);
      this.scrollLockTimer = null;
    }
    const view = this.document.defaultView;
    view?.removeEventListener('scroll', this.extendScrollLock);
    view?.removeEventListener('scrollend', this.releaseScrollLock);
    view?.removeEventListener('wheel', this.releaseScrollLock);
    view?.removeEventListener('touchstart', this.releaseScrollLock);
  }

  private setupIntersectionObserver(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: '-35% 0px -55% 0px',
      threshold: 0,
    };

    this.observer = new IntersectionObserver((entries) => {
      if (this.scrollLocked) return;
      for (const entry of entries) {
        if (entry.isIntersecting) {
          this.activeSection.set(entry.target.id);
        }
      }
    }, options);

    for (const item of this.navItems) {
      const el = this.document.getElementById(item.id);
      if (el) {
        this.observer.observe(el);
      }
    }
  }
}
