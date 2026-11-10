import { Component, signal } from '@angular/core';
import { PROFILE } from '../../profile';

type SendState = 'idle' | 'sending' | 'sent' | 'error';

interface FormspreeError {
  message: string;
}

// Formspree forwards each message to the owner's inbox. The form ID is not a
// secret: Formspree's own HTML examples put it in the form's action URL.
export const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xyeerjyp';

@Component({
  selector: 'app-contact',
  imports: [],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  readonly endpoint = FORMSPREE_ENDPOINT;
  readonly profile = PROFILE;
  readonly state = signal<SendState>('idle');
  readonly errorDetail = signal('');

  // Typing a new message hides the previous send's result.
  clearStatus(): void {
    if (this.state() === 'sent' || this.state() === 'error') {
      this.state.set('idle');
    }
  }

  async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    this.state.set('sending');
    this.errorDetail.set('');

    try {
      // Accept: application/json makes Formspree reply with JSON instead of
      // redirecting to its thank-you page.
      const response = await fetch(this.endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        form.reset();
        this.state.set('sent');
        return;
      }

      const data = await response.json().catch(() => ({}));
      if (Array.isArray(data?.errors)) {
        // The template adds its own full stop, so drop any the messages end with.
        this.errorDetail.set(data.errors.map((e: FormspreeError) => e.message.replace(/\.+$/, '')).join(', '));
      }
      this.state.set('error');
    } catch {
      // Network failure, or a blocked request: the message did not leave the page.
      this.state.set('error');
    }
  }
}
