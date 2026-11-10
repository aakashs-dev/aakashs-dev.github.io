import { Component, computed, input, signal } from '@angular/core';
import { nowOf, RoadmapProject, Stage, STATE_TEXT, stepName } from '../projects.model';

// The view of a portfolio card once opened: what the project is, then each stage with its phases.
@Component({
  selector: 'app-project-plan',
  imports: [],
  templateUrl: './project-plan.html',
  styleUrl: './project-plan.scss',
})
export class ProjectPlan {
  readonly project = input.required<RoadmapProject>();
  readonly stateText = STATE_TEXT;
  readonly stepName = stepName;

  // The stage under way (or next), and its phase in progress (or next).
  readonly active = computed(() => nowOf(this.project()));

  // The active stage starts unfolded and the others folded; a click flips one stage from its default.
  private readonly flipped = signal<ReadonlySet<string>>(new Set());

  isUnfolded(stage: Stage): boolean {
    return (stage === this.active()?.stage) !== this.flipped().has(stage.title);
  }

  stepsId(stage: Stage): string {
    return `steps-${this.project().id}-${stage.short.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  }

  fold(stage: Stage): void {
    const next = new Set(this.flipped());
    if (!next.delete(stage.title)) {
      next.add(stage.title);
    }
    this.flipped.set(next);
  }
}
