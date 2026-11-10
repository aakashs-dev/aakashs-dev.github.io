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
    const titles = fixture.componentInstance.projects.map((p) => p.title);
    for (const [i, button] of toggles().entries()) {
      expect(button.getAttribute('aria-label')).toBe(`View project: ${titles[i]}`);
    }
  });

  it('opens a plan on click and closes it on a second click', () => {
    const [first] = toggles();
    const id = fixture.componentInstance.projects[0].id;

    click(first);
    expect(plan(id).hidden).toBe(false);
    expect(first.getAttribute('aria-expanded')).toBe('true');
    expect(first.textContent).toContain('Hide project');

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

  it('shows each card\'s stages as a track, marked with their state', () => {
    const cards = Array.from(root.querySelectorAll<HTMLElement>('.project-card'));
    fixture.componentInstance.projects.forEach((project, i) => {
      const markers = Array.from(cards[i].querySelectorAll('.track .track-step'));
      expect(markers.length).toBe(project.stages.length);
      markers.forEach((m, j) => expect(m.classList).toContain(project.stages[j].state));
    });
  });

  it('names the stage under way, or the next one', () => {
    const lines = Array.from(root.querySelectorAll('.track-now')).map((e) => e.textContent!.replace(/\s+/g, ' ').trim());
    expect(lines[0]).toBe('Now: Horizon 0: Foundations');
    expect(lines[1]).toBe('Next: First release');
  });

  it('draws the flow diagram on each card from its design, box by box', () => {
    const cards = Array.from(root.querySelectorAll<HTMLElement>('.project-card'));
    fixture.componentInstance.projects.forEach((project, i) => {
      const labels = Array.from(cards[i].querySelectorAll('.flow .flow-label')).map((e) => e.textContent);
      expect(labels).toEqual(project.flow.map((n) => n.label));
    });
  });

  it('opens to every stage, each with its own phases, states and done-when', () => {
    const project = fixture.componentInstance.projects[0];
    click(toggles()[0]);

    const stages = Array.from(plan(project.id).querySelectorAll(':scope > .stages > .stage'));
    expect(stages.length).toBe(project.stages.length);
    expect(stages.map((s) => s.querySelector('.stage-title')!.textContent)).toEqual(project.stages.map((s) => s.title));

    // Horizon 0, the stage under way, starts unfolded; only phase 4, in progress, says when it is done.
    const phases = Array.from(stages[0].querySelectorAll('.step'));
    expect(phases.length).toBe(project.stages[0].steps!.length);
    expect(phases[4].textContent).toContain('In progress');
    expect(phases.filter((p) => p.querySelector('.step-done-when')).length).toBe(1);
    expect(phases[4].querySelector('.step-done-when')).not.toBeNull();
    // A horizon without phases still states its exit.
    expect(stages[2].querySelector('.step-done-when')!.textContent).toContain('Exit:');
  });

  it('folds the phases of stages not under way, and unfolds them on click', () => {
    const project = fixture.componentInstance.projects[1];
    click(toggles()[1]);
    const stages = Array.from(plan(project.id).querySelectorAll<HTMLElement>(':scope > .stages > .stage'));
    const later = stages[2];
    const button = later.querySelector<HTMLButtonElement>('.fold')!;

    const list = (stage: HTMLElement) => stage.querySelector<HTMLElement>('.steps')!;
    expect(list(stages[1]).hidden).toBe(false);
    expect(list(later).hidden).toBe(true);
    // The button names its stage for screen readers and points at the list it folds.
    expect(button.textContent!.replace(/\s+/g, ' ').trim())
      .toBe(`Show ${project.stages[2].steps!.length} phases of ${project.stages[2].title}`);
    expect(button.getAttribute('aria-controls')).toBe(list(later).id);
    expect(button.getAttribute('aria-expanded')).toBe('false');

    click(button);
    expect(list(later).hidden).toBe(false);
    expect(later.querySelectorAll('.step').length).toBe(project.stages[2].steps!.length);
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  it('shows no GitHub link until a project has a repository', () => {
    const withRepo = fixture.componentInstance.projects.filter((p) => p.repoLink).length;
    expect(root.querySelectorAll('a.btn-link:not(.live-link)').length).toBe(withRepo);
  });
});
