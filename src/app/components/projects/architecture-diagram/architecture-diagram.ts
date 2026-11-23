import { Component, computed, input, linkedSignal } from '@angular/core';
import { ArchEdge, ArchitectureSpec } from '../projects.model';

let nextDiagramId = 0;

@Component({
  selector: 'app-architecture-diagram',
  standalone: true,
  templateUrl: './architecture-diagram.html',
  styleUrl: './architecture-diagram.scss',
})
export class ArchitectureDiagram {
  readonly spec = input.required<ArchitectureSpec>();

  private readonly uid = `arch-${++nextDiagramId}`;
  readonly markerDefaultId = `${this.uid}-arrow`;
  readonly markerActiveId = `${this.uid}-arrow-active`;

  readonly selectedId = linkedSignal(() => this.spec().defaultNodeId);

  readonly selectedNode = computed(() => {
    const id = this.selectedId();
    return this.spec().nodes.find((n) => n.id === id) ?? this.spec().nodes[0];
  });

  select(nodeId: string): void {
    this.selectedId.set(nodeId);
  }

  onKeyDown(event: KeyboardEvent, nodeId: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.select(nodeId);
    }
  }

  isEdgeConnected(edge: ArchEdge): boolean {
    const id = this.selectedId();
    return edge.from === id || edge.to === id;
  }

  isNodeRelated(nodeId: string): boolean {
    const id = this.selectedId();
    if (nodeId === id) return true;
    return this.spec().edges.some(
      (e) => (e.from === id && e.to === nodeId) || (e.to === id && e.from === nodeId),
    );
  }
}
