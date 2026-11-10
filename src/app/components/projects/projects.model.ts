// The shape of a portfolio card's plan, shared by the card and its opened plan.

export type StepState = 'done' | 'current' | 'planned';

export interface Step {
  label: string;
  title: string;
  doneWhen?: string;
  state: StepState;
}

// A stage of the big picture (a horizon, or a blueprint stage), holding its phases.
export interface Stage {
  short: string;
  title: string;
  state: StepState;
  summary?: string;
  exit?: string;
  steps?: Step[];
}

// One box of the card's flow diagram: how the finished system works, from the blueprint's design.
export interface FlowNode {
  label: string;
  detail: string;
}

export interface RoadmapProject {
  id: string;
  title: string;
  domain: string;
  tagline: string;
  flow: FlowNode[];
  description: string;
  firstRelease?: string;
  note?: string;
  status: string;
  technologies: string[];
  // Shown when the card is opened. Taken from each project's blueprint or roadmap.
  problem: string;
  stagesHeading: string;
  stages: Stage[];
  repoLink?: string;
  requestLink?: string;
}

export const STATE_TEXT: Record<StepState, string> = { done: 'Done', current: 'In progress', planned: 'Planned' };

export const stepName = (s: Step): string => `Phase ${s.label}: ${s.title}`;

// The first stage not yet done, and the phase inside it that is in progress or comes next.
export function nowOf(project: RoadmapProject): { stage: Stage; step?: Step } | undefined {
  const stage = project.stages.find((s) => s.state !== 'done');
  if (!stage) {
    return undefined;
  }
  const steps = stage.steps ?? [];
  return { stage, step: steps.find((s) => s.state === 'current') ?? steps.find((s) => s.state === 'planned') };
}
