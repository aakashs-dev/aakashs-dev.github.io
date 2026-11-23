import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, OnDestroy, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { About } from '../about/about';
import { Certifications } from '../certifications/certifications';
import { Contact } from '../contact/contact';
import { Projects } from '../projects/projects';
import { Resume } from '../resume/resume';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [About, Resume, Projects, Certifications, Contact],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly roles = ['Data Analyst', 'Software Engineer'];
  readonly displayedText = signal('Data Analyst & Software Engineer');
  readonly showCursor = signal(true);
  readonly reducedMotion = signal(false);

  private currentRoleIndex = 0;
  private readonly typingSpeed = 100;
  private readonly deletingSpeed = 50;
  private readonly pauseDuration = 2000;

  private destroyed = false;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private cursorIntervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    if (!this.isBrowser) return;

    const view = this.document.defaultView;
    const prefersReduced =
      typeof view?.matchMedia === 'function'
        ? view.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;
    this.reducedMotion.set(prefersReduced);

    if (prefersReduced) {
      this.displayedText.set('Data Analyst & Software Engineer');
      return;
    }

    this.displayedText.set('');
    void this.typeNextRole();
    this.cursorIntervalId = setInterval(() => {
      this.showCursor.update((v) => !v);
    }, 500);
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.timeoutId !== null) clearTimeout(this.timeoutId);
    if (this.cursorIntervalId !== null) clearInterval(this.cursorIntervalId);
  }

  private getCommonPrefix(s1: string, s2: string): string {
    let i = 0;
    while (i < s1.length && i < s2.length && s1[i] === s2[i]) {
      i++;
    }
    return s1.substring(0, i);
  }

  private async typeNextRole(): Promise<void> {
    if (this.destroyed) return;

    const currentFullText = this.roles[this.currentRoleIndex];
    const nextIndex = (this.currentRoleIndex + 1) % this.roles.length;
    const nextFullText = this.roles[nextIndex];

    if (this.displayedText().length === 0) {
      await this.typeText(currentFullText);
      await this.sleep(this.pauseDuration);
    }

    if (this.destroyed) return;
    const commonPrefix = this.getCommonPrefix(currentFullText, nextFullText);
    await this.deleteTextDownTo(commonPrefix.length);
    await this.typeText(nextFullText, commonPrefix.length);

    this.currentRoleIndex = nextIndex;
    await this.sleep(this.pauseDuration);
    if (!this.destroyed) {
      void this.typeNextRole();
    }
  }

  private async typeText(target: string, startIndex = 0): Promise<void> {
    for (let i = startIndex; i <= target.length; i++) {
      if (this.destroyed) return;
      this.displayedText.set(target.substring(0, i));
      if (i < target.length) {
        await this.sleep(this.typingSpeed);
      }
    }
  }

  private async deleteTextDownTo(targetLength: number): Promise<void> {
    let currentText = this.displayedText();
    while (currentText.length > targetLength) {
      if (this.destroyed) return;
      currentText = currentText.substring(0, currentText.length - 1);
      this.displayedText.set(currentText);
      await this.sleep(this.deletingSpeed);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      this.timeoutId = setTimeout(resolve, ms);
    });
  }
}
