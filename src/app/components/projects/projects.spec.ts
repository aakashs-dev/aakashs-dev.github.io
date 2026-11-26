import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Projects } from './projects';

describe('Portfolio section & interactive architecture diagrams', () => {
  let fixture: ComponentFixture<Projects>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Projects] }).compileComponents();
    fixture = TestBed.createComponent(Projects);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  const triggers = () => Array.from(root.querySelectorAll<HTMLButtonElement>('.dossier-trigger'));
  const dialog = () => root.querySelector<HTMLDialogElement>('#blueprint-dossier')!;

  function click(el: HTMLElement): void {
    el.click();
    fixture.detectChanges();
  }

  it('features TheNumbersGame on top and renders all 6 planned blueprints including MailShield', () => {
    const cmp = fixture.componentInstance;
    expect(cmp.featuredProject.id).toBe('the-numbers-game');
    expect(cmp.blueprints.length).toBe(6);
    expect(cmp.blueprints.map((b) => b.id)).toContain('mailshield');
    expect(root.querySelectorAll('.featured-card').length).toBe(1);
    expect(root.querySelectorAll('.blueprint-card').length).toBe(6);
  });

  it('renders an interactive master architecture SVG on the featured card and updates inspector on click', () => {
    const featured = root.querySelector('.featured-card')!;
    const nodes = Array.from(featured.querySelectorAll<SVGGElement>('.arch-node'));
    expect(nodes.length).toBe(fixture.componentInstance.featuredProject.architecture.nodes.length);

    const inspector = featured.querySelector('.arch-inspector')!;
    expect(inspector.textContent).toContain('OrderEgressWorker');

    // Click the first node (Kite WebSocket) and verify inspector updates
    nodes[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(inspector.textContent).toContain('Kite WebSocket');
    expect(nodes[0].getAttribute('aria-pressed')).toBe('true');
  });

  it('opens the native dialog blueprint dossier with architecture SVG and full phase plan, then closes', () => {
    expect(dialog().hasAttribute('open')).toBe(false);

    // Open MailShield (last trigger)
    const allTriggers = triggers();
    expect(allTriggers.length).toBe(7);
    click(allTriggers[allTriggers.length - 1]);

    expect(dialog().hasAttribute('open')).toBe(true);
    expect(dialog().querySelector('#dossier-title')?.textContent?.trim()).toBe('MailShield');
    expect(dialog().querySelectorAll('.arch-node').length).toBeGreaterThan(5);
    expect(dialog().querySelector('#plan-mailshield')).not.toBeNull();

    const closeBtn = dialog().querySelector<HTMLButtonElement>('.dossier-close')!;
    click(closeBtn);
    expect(dialog().hasAttribute('open')).toBe(false);
  });

  it('reflects TheNumbersGame Phase 4 (UI blocked) and Phase 5 (in progress) with post-4.8 node names', () => {
    const tng = fixture.componentInstance.featuredProject;
    const sublabels = tng.architecture.nodes.map((n) => n.sublabel);
    expect(sublabels).toContain('KiteFrameDecoder');
    expect(sublabels).toContain('TickPersistenceWorker');

    click(triggers()[0]);
    const plan = dialog().querySelector<HTMLElement>('#plan-the-numbers-game')!;
    const currentSteps = Array.from(plan.querySelectorAll<HTMLElement>('.step.current'));
    expect(currentSteps.length).toBe(2);
    expect(currentSteps[0].textContent).toContain('Phase 4: Code re-layout');
    expect(currentSteps[0].textContent).toContain('4.9');
    expect(currentSteps[1].textContent).toContain('Phase 5: Bug fixes');
    expect(currentSteps[1].textContent).toContain('pykiteconnect');
  });

  it('folds non-active phases inside the opened dossier and unfolds them on click', () => {
    // Open NEM-Pulse (index 1)
    click(triggers()[1]);
    const plan = dialog().querySelector<HTMLElement>('#plan-nem-pulse')!;
    const stages = Array.from(plan.querySelectorAll<HTMLElement>(':scope > .stages > .stage'));
    const later = stages[2];
    const foldBtn = later.querySelector<HTMLButtonElement>('.fold')!;
    const list = later.querySelector<HTMLElement>('.steps')!;

    expect(list.hidden).toBe(true);
    expect(foldBtn.getAttribute('aria-expanded')).toBe('false');

    click(foldBtn);
    expect(list.hidden).toBe(false);
    expect(foldBtn.getAttribute('aria-expanded')).toBe('true');
  });

  it('shows each project stage track and names the active or next stage', () => {
    const lines = Array.from(root.querySelectorAll('.track-now')).map((e) =>
      e.textContent!.replace(/\s+/g, ' ').trim(),
    );
    expect(lines[0]).toBe('Now: Horizon 0: Foundations');
    expect(lines[1]).toBe('Next: First release');
  });

  it('has valid, non-overlapping SVG geometry and valid edge references across all 7 master architectures', () => {
    for (const project of fixture.componentInstance.projects) {
      const arch = project.architecture;
      const [, , vw, vh] = arch.viewBox.split(' ').map(Number);
      const ids = new Set(arch.nodes.map((n) => n.id));

      expect(ids.has(arch.defaultNodeId)).toBe(true);
      for (const edge of arch.edges) {
        expect(ids.has(edge.from)).toBe(true);
        expect(ids.has(edge.to)).toBe(true);
      }

      for (let i = 0; i < arch.nodes.length; i++) {
        const a = arch.nodes[i];
        expect(a.x).toBeGreaterThanOrEqual(0);
        expect(a.y).toBeGreaterThanOrEqual(0);
        expect(a.x + a.w).toBeLessThanOrEqual(vw);
        expect(a.y + a.h).toBeLessThanOrEqual(vh);

        for (let j = i + 1; j < arch.nodes.length; j++) {
          const b = arch.nodes[j];
          const overlaps = a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
          expect(overlaps, `${project.id}: ${a.id} overlaps ${b.id}`).toBe(false);
        }
      }
    }
  });
});
