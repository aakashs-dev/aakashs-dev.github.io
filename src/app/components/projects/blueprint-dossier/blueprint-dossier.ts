import { Component, ElementRef, effect, input, output, viewChild } from '@angular/core';
import { ArchitectureDiagram } from '../architecture-diagram/architecture-diagram';
import { ProjectPlan } from '../project-plan/project-plan';
import { RoadmapProject } from '../projects.model';

@Component({
  selector: 'app-blueprint-dossier',
  standalone: true,
  imports: [ArchitectureDiagram, ProjectPlan],
  templateUrl: './blueprint-dossier.html',
  styleUrl: './blueprint-dossier.scss',
})
export class BlueprintDossier {
  readonly project = input<RoadmapProject | null>(null);
  readonly closed = output<void>();

  readonly dialogRef = viewChild<ElementRef<HTMLDialogElement>>('dossierDialog');

  constructor() {
    effect(() => {
      const current = this.project();
      const dialog = this.dialogRef()?.nativeElement;
      if (!dialog) return;

      if (current && !dialog.open) {
        if (typeof dialog.showModal === 'function') {
          dialog.showModal();
        } else {
          dialog.setAttribute('open', '');
        }
      } else if (!current && dialog.open) {
        if (typeof dialog.close === 'function') {
          dialog.close();
        } else {
          dialog.removeAttribute('open');
        }
      }
    });
  }

  close(): void {
    const dialog = this.dialogRef()?.nativeElement;
    if (dialog?.open) {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
    }
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    const dialog = this.dialogRef()?.nativeElement;
    if (dialog && event.target === dialog) {
      this.close();
    }
  }

  onNativeClose(): void {
    this.closed.emit();
  }
}
