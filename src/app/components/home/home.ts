import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { About } from '../about/about';
import { Resume } from '../resume/resume';
import { Extracurricular } from '../extracurricular/extracurricular';
import { Projects } from '../projects/projects';
import { Certifications } from '../certifications/certifications';
import { Contact } from '../contact/contact';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [About, Resume, Extracurricular, Projects, Certifications, Contact],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit, OnDestroy {
  roles = ['Data Analyst', 'Data Scientist', 'Software Engineer'];
  currentRoleIndex = 0;
  
  displayedText = signal('');
  showCursor = signal(true);
  
  private typingSpeed = 100;
  private deletingSpeed = 50;
  private pauseDuration = 2000;
  
  private timeoutId: any;
  private cursorIntervalId: any;

  ngOnInit() {
    this.startTypewriter();
    this.cursorIntervalId = setInterval(() => {
      this.showCursor.update(v => !v);
    }, 500);
  }

  ngOnDestroy() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.cursorIntervalId) clearInterval(this.cursorIntervalId);
  }

  private startTypewriter() {
    this.typeNextRole();
  }

  private getCommonPrefix(s1: string, s2: string): string {
    let i = 0;
    while (i < s1.length && i < s2.length && s1[i] === s2[i]) {
      i++;
    }
    return s1.substring(0, i);
  }

  private async typeNextRole() {
    const currentFullText = this.roles[this.currentRoleIndex];
    const nextIndex = (this.currentRoleIndex + 1) % this.roles.length;
    const nextFullText = this.roles[nextIndex];
    
    // 1. Type current role if it's empty (initial state)
    if (this.displayedText().length === 0) {
      await this.typeText(currentFullText);
      await this.sleep(this.pauseDuration);
    }
    
    // 2. Find common prefix between current and next
    const commonPrefix = this.getCommonPrefix(currentFullText, nextFullText);
    
    // 3. Delete characters down to the common prefix
    await this.deleteTextDownTo(commonPrefix.length);
    
    // 4. Type the rest of the next role
    await this.typeText(nextFullText, commonPrefix.length);
    
    this.currentRoleIndex = nextIndex;
    
    // 5. Pause and recurse
    await this.sleep(this.pauseDuration);
    this.typeNextRole();
  }

  private async typeText(target: string, startIndex: number = 0) {
    for (let i = startIndex; i <= target.length; i++) {
      this.displayedText.set(target.substring(0, i));
      if (i < target.length) {
        await this.sleep(this.typingSpeed);
      }
    }
  }

  private async deleteTextDownTo(targetLength: number) {
    let currentText = this.displayedText();
    while (currentText.length > targetLength) {
      currentText = currentText.substring(0, currentText.length - 1);
      this.displayedText.set(currentText);
      await this.sleep(this.deletingSpeed);
    }
  }

  private sleep(ms: number) {
    return new Promise(resolve => {
      this.timeoutId = setTimeout(resolve, ms);
    });
  }
}
