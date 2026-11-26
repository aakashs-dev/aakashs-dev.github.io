import { Component, computed, inject, signal } from '@angular/core';
import { TelemetryService } from '../../services/telemetry.service';
import { ArchitectureDiagram } from './architecture-diagram/architecture-diagram';
import { BlueprintDossier } from './blueprint-dossier/blueprint-dossier';
import { PORTFOLIO_PROJECTS } from './projects.data';
import { nowOf, RoadmapProject, STATE_TEXT } from './projects.model';

@Component({
  selector: 'app-projects',
  imports: [ArchitectureDiagram, BlueprintDossier],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects {
  private readonly telemetry = inject(TelemetryService);
  readonly statusDate = 'November 2026';
  readonly stateText = STATE_TEXT;
  readonly now = nowOf;

  readonly projects: RoadmapProject[] = PORTFOLIO_PROJECTS;
  readonly featuredProject = this.projects.find((p) => p.featured) ?? this.projects[0];
  readonly blueprints = this.projects.filter((p) => p.id !== this.featuredProject.id);

  readonly activeId = signal<string | null>(null);

  readonly activeProject = computed(() => {
    const id = this.activeId();
    return id ? (this.projects.find((p) => p.id === id) ?? null) : null;
  });

  openDossier(id: string): void {
    this.activeId.set(id);
    this.telemetry.track('dossier_open', id);
  }

  closeDossier(): void {
    this.activeId.set(null);
  }
}
