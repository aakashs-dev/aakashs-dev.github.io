import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Contact, FORMSPREE_ENDPOINT } from './contact';

describe('Contact form', () => {
  let fixture: ComponentFixture<Contact>;
  let form: HTMLFormElement;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await TestBed.configureTestingModule({ imports: [Contact] }).compileComponents();
    fixture = TestBed.createComponent(Contact);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    form = root.querySelector('form')!;
    (root.querySelector('#name') as HTMLInputElement).value = 'Ada';
    (root.querySelector('#email') as HTMLInputElement).value = 'ada@example.com';
    (root.querySelector('#message') as HTMLTextAreaElement).value = 'Hello';
  });

  afterEach(() => vi.unstubAllGlobals());

  // Calls the handler directly so the test can await it; the event's target is the form, as on a real submit.
  async function dispatchSubmit(): Promise<string> {
    const event = new SubmitEvent('submit', { cancelable: true });
    Object.defineProperty(event, 'target', { value: form });
    await fixture.componentInstance.onSubmit(event);
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).querySelector('.form-status')!.textContent!.trim();
  }

  it('posts the fields and the honeypot to Formspree as JSON-accepting form data', async () => {
    fetchMock.mockResolvedValue(new Response('{"ok":true}', { status: 200 }));

    await dispatchSubmit();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(FORMSPREE_ENDPOINT);
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ Accept: 'application/json' });
    const body = init.body as FormData;
    expect(body.get('name')).toBe('Ada');
    expect(body.get('email')).toBe('ada@example.com');
    expect(body.get('message')).toBe('Hello');
    expect(body.get('_gotcha')).toBe('');
  });

  it('confirms and clears the form when Formspree accepts the message', async () => {
    fetchMock.mockResolvedValue(new Response('{"ok":true}', { status: 200 }));

    const status = await dispatchSubmit();

    expect(status).toContain('your message has been sent');
    expect((form.querySelector('#message') as HTMLTextAreaElement).value).toBe('');
  });

  it('shows Formspree validation errors and keeps the typed message', async () => {
    fetchMock.mockResolvedValue(
      new Response('{"errors":[{"message":"should be an email"}]}', { status: 422 })
    );

    const status = await dispatchSubmit();

    expect(status).toContain('could not be sent: should be an email');
    expect((form.querySelector('#message') as HTMLTextAreaElement).value).toBe('Hello');
  });

  it('sends through the template binding and disables the button until Formspree answers', async () => {
    let answer!: (r: Response) => void;
    fetchMock.mockReturnValue(new Promise<Response>((resolve) => (answer = resolve)));
    const button = form.querySelector('.submit-btn') as HTMLButtonElement;

    form.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
    fixture.detectChanges();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain('Sending');

    answer(new Response('{"ok":true}', { status: 200 }));
    await vi.waitFor(() => expect(fixture.componentInstance.state()).toBe('sent'));
    fixture.detectChanges();
    expect(button.disabled).toBe(false);
  });

  it('marks name, email and message as required', () => {
    for (const id of ['#name', '#email', '#message']) {
      expect((form.querySelector(id) as HTMLInputElement).required).toBe(true);
    }
  });

  it('hides the previous result once the visitor types again', async () => {
    fetchMock.mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
    await dispatchSubmit();

    form.querySelector('#message')!.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    const status = (fixture.nativeElement as HTMLElement).querySelector('.form-status')!.textContent!.trim();
    expect(status).toBe('');
  });

  it('ends the error with one full stop when Formspree messages already have one', async () => {
    fetchMock.mockResolvedValue(
      new Response('{"errors":[{"message":"Email is invalid."}]}', { status: 422 })
    );

    const status = await dispatchSubmit();

    expect(status).toContain('could not be sent: Email is invalid.');
    expect(status).not.toContain('..');
  });

  it('falls back to the email address when the request never reaches Formspree', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    const status = await dispatchSubmit();

    expect(status).toContain('could not be sent');
    expect(status).toContain('aakashx97@gmail.com');
  });
});
