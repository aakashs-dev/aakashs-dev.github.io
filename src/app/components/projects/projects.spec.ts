import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Projects } from './projects';

describe('Portfolio cards', () => {
  let fixture: ComponentFixture<Projects>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Projects] }).compileComponents();
    fixture = TestBed.createComponent(Projects);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  const toggles = () => Array.from(root.querySelectorAll<HTMLButtonElement>('.plan-toggle'));
  const plan = (id: string) => root.querySelector<HTMLElement>(`#plan-${id}`)!;

  function click(button: HTMLButtonElement): void {
    button.click();
    fixture.detectChanges();
  }

  it('starts with every plan closed, and each toggle points at its own plan', () => {
    expect(toggles().length).toBe(fixture.componentInstance.projects.length);
    for (const project of fixture.componentInstance.projects) {
      expect(plan(project.id).hidden).toBe(true);
    }
    for (const button of toggles()) {
      expect(button.getAttribute('aria-expanded')).toBe('false');
      expect(root.querySelector('#' + button.getAttribute('aria-controls'))).not.toBeNull();
    }
  });

  it('opens a plan on click and closes it on a second click', () => {
    const [first] = toggles();
    const id = fixture.componentInstance.projects[0].id;

    click(first);
    expect(plan(id).hidden).toBe(false);
    expect(first.getAttribute('aria-expanded')).toBe('true');
    expect(first.textContent).toContain('Hide plan');

    click(first);
    expect(plan(id).hidden).toBe(true);
    expect(first.getAttribute('aria-expanded')).toBe('false');
  });

  it('keeps one plan open at a time', () => {
    const [first, second] = toggles();
    const [a, b] = fixture.componentInstance.projects;

    click(first);
    click(second);

    expect(plan(a.id).hidden).toBe(true);
    expect(plan(b.id).hidden).toBe(false);
  });

  it('shows no GitHub link until a project has a repository', () => {
    const withRepo = fixture.componentInstance.projects.filter((p) => p.repoLink).length;
    expect(root.querySelectorAll('a.btn-link:not(.live-link)').length).toBe(withRepo);
  });
});
