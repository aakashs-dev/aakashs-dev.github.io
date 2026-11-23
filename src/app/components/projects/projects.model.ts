// The shape of a portfolio project, its roadmap plan, and its interactive master architecture.

export type StepState = 'done' | 'current' | 'planned';

export interface Step {
  label: string;
  title: string;
  doneWhen?: string;
  state: StepState;
}

export interface Stage {
  short: string;
  title: string;
  state: StepState;
  summary?: string;
  exit?: string;
  steps?: Step[];
}

export type ArchNodeKind = 'source' | 'process' | 'store' | 'guard' | 'output';

export interface ArchZone {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  dashed?: boolean;
}

export interface ArchNode {
  id: string;
  label: string;
  sublabel: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: ArchNodeKind;
  planned?: boolean;
  role: string;
  constraint: string;
  scopeNote: string;
}

export interface ArchEdge {
  id: string;
  from: string;
  to: string;
  path: string;
  label?: string;
  labelX?: number;
  labelY?: number;
  dashed?: boolean;
}

export interface ArchitectureSpec {
  figureCode: string;
  caption: string;
  viewBox: string;
  minWidthPx: number;
  defaultNodeId: string;
  zones: ArchZone[];
  nodes: ArchNode[];
  edges: ArchEdge[];
}

export interface RoadmapProject {
  id: string;
  blueprintCode: string;
  featured?: boolean;
  title: string;
  domain: string;
  tagline: string;
  problemSummary: string;
  primarySource: string;
  architecture: ArchitectureSpec;
  description: string;
  firstRelease?: string;
  note?: string;
  status: string;
  technologies: string[];
  problem: string;
  stagesHeading: string;
  stages: Stage[];
  repoLink?: string;
  requestLink?: string;
}

export const STATE_TEXT: Record<StepState, string> = {
  done: 'Done',
  current: 'In progress',
  planned: 'Planned',
};

export const stepName = (s: Step): string => `Phase ${s.label}: ${s.title}`;

export function nowOf(project: RoadmapProject): { stage: Stage; step?: Step } | undefined {
  const stage = project.stages.find((s) => s.state !== 'done');
  if (!stage) {
    return undefined;
  }
  const steps = stage.steps ?? [];
  return {
    stage,
    step: steps.find((s) => s.state === 'current') ?? steps.find((s) => s.state === 'planned'),
  };
}
