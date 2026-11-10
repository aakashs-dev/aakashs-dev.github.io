import { Component, signal } from '@angular/core';
import { PROFILE } from '../../profile';
import { ProjectPlan } from './project-plan/project-plan';
import { nowOf, RoadmapProject, Stage, STATE_TEXT, Step, StepState } from './projects.model';

const step = (state: StepState, label: string, title: string, doneWhen?: string): Step =>
  ({ state, label, title, doneWhen });

// Phase 0 of blueprints 01 to 04: set up, then check the external rules the first release depends on.
const setUp = (rules: string, doneWhen = 'The gates pass, and every rule the first release depends on is checked against its source.'): Step =>
  step('planned', '0', `Set up the repository, rules and test runner; ${rules}`, doneWhen);

const design = (summary: string): Stage => ({ short: 'Design', title: 'Design', state: 'done', summary });

const BLUEPRINT_WRITTEN = 'Plan written: the problem, scope, external rules, design, phases and the evidence to collect.';

const firstRelease = (steps: Step[]): Stage => ({ short: 'First release', title: 'First release', state: 'planned', steps });

const extensions = (items: string[]): Stage => ({
  short: 'Extensions',
  title: 'After the first release',
  state: 'planned',
  summary: 'One phase each, in this order.',
  steps: items.map((title, i) => step('planned', String(5 + i), title)),
});

@Component({
  selector: 'app-projects',
  imports: [ProjectPlan],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects {
  statusDate = 'November 2026';
  readonly stateText = STATE_TEXT;

  // One card is open at a time; null means all are closed.
  readonly openId = signal<string | null>(null);

  toggle(id: string): void {
    this.openId.set(this.openId() === id ? null : id);
  }


  readonly now = nowOf;

  projects: RoadmapProject[] = [
    {
      id: 'the-numbers-game',
      title: 'TheNumbersGame',
      domain: 'Indian equities',
      tagline: 'A trading system for NSE equities through Zerodha\'s Kite API.',
      flow: [
        { label: 'Kite market data', detail: 'live ticks over WebSocket' },
        { label: 'C# trading node', detail: 'decode, strategies, risk; orders out, fail-closed' },
        { label: 'Parquet lake', detail: 'every tick kept for replay' },
        { label: 'Python research', detail: 'backtests on the stored data' }
      ],
      description: 'A single-owner system being built for the National Stock Exchange through Zerodha\'s Kite Connect API: it captures the market data Kite streams, stores it for replay and research, backtests strategies in Python, and places orders behind risk controls that fail closed.',
      note: 'No real money is traded until a written readiness gate is met. The repository is private; I can walk you through it on request.',
      status: 'In progress · private',
      technologies: ['C# .NET', 'Python', 'React', 'DuckDB', 'Parquet', 'Arrow Flight'],
      problem: 'Staying correct under real constraints: an undocumented byte order in the market-data feed, broker rate limits, partial fills, daily login tokens, exchange holidays, and stopping safely when something goes wrong.',
      stagesHeading: 'Flight plan',
      stages: [
        {
          short: 'Horizon 0',
          title: 'Horizon 0: Foundations',
          state: 'current',
          summary: 'Bring the existing code under control.',
          exit: 'Roadmap phase 7 is done.',
          steps: [
            step('done', '0', 'Governance: standards, workflow and agent rules'),
            step('done', '1', 'Ground truth: an audit of what is actually built'),
            step('done', '2', 'Documentation tooling, and migration of the old design records'),
            step('done', '3', 'Corrective design decisions for the audit\'s findings'),
            step('current', '4', 'Code re-layout', 'The UI moves to the target layout, the last item: the C# and Python moves and the renames are done, and the UI move waits on an open decision about the cockpit.'),
            step('planned', '5', 'Bug fixes, each writing the reference documents it touches'),
            step('planned', '6', 'Refactors, with their documents'),
            step('planned', '7', 'The remaining documentation'),
          ]
        },
        {
          short: 'Horizon 1',
          title: 'Horizon 1: Paper trading',
          state: 'planned',
          summary: 'Strategies run on live market data with simulated orders, and the risk-tolerance charter and fault recovery are designed.',
          exit: 'A paper-trading record that the live-readiness criteria can be judged against.'
        },
        {
          short: 'Horizon 2',
          title: 'Horizon 2: Live readiness',
          state: 'planned',
          summary: 'A design record sets the live-readiness criteria: whose account is traded and with whose authorisation, tax, who may act if the operator is unavailable, and clock checks.',
          exit: 'The paper-trading record meets each criterion, with evidence; only then does live trading start.'
        },
        {
          short: 'Horizon 3',
          title: 'Horizon 3: Wider scope',
          state: 'planned',
          summary: 'Ideas, not commitments: other markets (ASX, NASDAQ) through another broker, a FIX adapter, and order-by-order market data.'
        }
      ],
      requestLink: `mailto:${PROFILE.email}?subject=TheNumbersGame%20walkthrough`
    },
    {
      id: 'nem-pulse',
      title: 'NEM-Pulse',
      domain: 'Australian electricity market',
      tagline: 'Negative prices, price separation and spike risk in the NEM.',
      flow: [
        { label: 'AEMO dispatch files', detail: 'five-minute prices, demand, flows' },
        { label: 'Data lake', detail: 'cleaned Parquet tables' },
        { label: 'Analysis', detail: 'negative prices, separation, spike tail' },
        { label: 'Notebook and Power BI', detail: 'research and report' }
      ],
      description: 'Turns AEMO\'s public five-minute dispatch files into a queryable data lake, to study when prices go negative, when regional prices separate, and how heavy the tail of price spikes is.',
      firstRelease: 'Twelve months of three dispatch tables across all regions, with a research notebook and a Power BI report.',
      status: 'Planned · not started',
      technologies: ['Python', 'Polars', 'DuckDB', 'Parquet', 'Power BI', 'Angular'],
      problem: 'The data is public but awkward: zipped CSVs that mix several tables in one file, dispatch runs that are revised so an interval can appear more than once, and years of five-minute data across five regions and hundreds of generating units that run to tens of millions of rows.',
      stagesHeading: 'The plan',
      stages: [
        design(BLUEPRINT_WRITTEN),
        firstRelease([
          setUp('check the market rules and data sources'),
          step('planned', '1', 'Ingest twelve months of the three dispatch tables', 'Twelve months ingested, fixture tests pass, and revision counts reported.'),
          step('planned', '2', 'Analysis tables and the price-spike notebook', 'The notebook runs clean from a fresh environment, and the tail fit is reported with its threshold sensitivity.'),
          step('planned', '3', 'Power BI report', 'The report reads the analysis tables, and each measure is documented.'),
          step('planned', '4', 'Benchmark and write-up', 'The benchmark is run with its method and hardware stated.'),
        ]),
        extensions([
          'Pre-dispatch forecast error',
          'Battery revenue across the energy and FCAS markets',
          'Curtailment of wind and solar output',
          'Interconnector settlement residues',
          'Marginal emissions',
          'Generator bid analysis'
        ])
      ]
    },
    {
      id: 'credit-vector',
      title: 'CreditVector',
      domain: 'Credit risk',
      tagline: 'Stress-testing a synthetic mortgage book, with AASB 9-style provisions.',
      flow: [
        { label: 'Calibration inputs', detail: 'RBA and ABS data, stated assumptions' },
        { label: 'Synthetic loan book', detail: 'seeded generator' },
        { label: 'Scenario model', detail: 'arrears transitions, expected credit loss' },
        { label: 'Notebook and Power BI', detail: 'provisions by scenario' }
      ],
      description: 'Stress-tests a synthetic Australian mortgage and small-business loan book under interest-rate, unemployment and house-price scenarios, and computes expected-credit-loss provisions in the style of AASB 9.',
      firstRelease: 'A seeded synthetic loan book, an arrears transition model, 12-month and lifetime expected-credit-loss calculations, a notebook and a Power BI report.',
      status: 'Planned · not started',
      technologies: ['Python', 'Polars', 'DuckDB', 'Parquet', 'Power BI', 'Angular'],
      problem: 'Lenders have to show how a loan book behaves when conditions worsen: how many borrowers fall behind and how fast, what that does to provisions, and whether funding covenants hold. The mechanics are well known but rarely shown end to end.',
      stagesHeading: 'The plan',
      stages: [
        design(BLUEPRINT_WRITTEN),
        firstRelease([
          setUp('check the accounting and prudential rules'),
          step('planned', '1', 'Synthetic loan book and clean tables', 'The generator is documented, seeded and tested, and its distributions are plotted against the calibration sources.'),
          step('planned', '2', 'Arrears transitions, the economic-scenario adjustment and expected credit loss', 'Hand-worked tests pass, and the notebook runs clean.'),
          step('planned', '3', 'Power BI report', 'Each measure is documented.'),
          step('planned', '4', 'Scenario recalculation benchmark', 'Time measured for the full book, with the hardware stated.'),
        ]),
        extensions([
          'Fixed-rate reset and interest-only expiry shocks',
          'Prepayment',
          'Warehouse covenant stress',
          'A securitisation loss waterfall',
          'Regional collateral haircuts using ABS area data',
          'Climate hazard overlays',
          'An interactive scenario view'
        ])
      ]
    },
    {
      id: 'fleet-pulse',
      title: 'FleetPulse',
      domain: 'Fleet telemetry',
      tagline: 'Cold-chain temperature and driver-fatigue checks on simulated trucks.',
      flow: [
        { label: 'Vehicle simulator', detail: 'seeded telemetry' },
        { label: 'C# ingestion', detail: 'bounded channels, drops counted' },
        { label: 'Analysis', detail: 'defrost-aware alarms, fatigue clocks' },
        { label: 'Map view and Power BI', detail: 'trips and alerts' }
      ],
      description: 'Uses simulated vehicle data to check whether refrigerated cargo stayed within temperature limits on a linehaul trip, and whether drivers stay inside heavy-vehicle fatigue rules.',
      firstRelease: 'A seeded vehicle simulator, telemetry ingestion into a lake, defrost-aware temperature alarms, a fatigue-hours state machine and a map view.',
      status: 'Planned · not started',
      technologies: ['C# .NET', 'Python', 'DuckDB', 'Parquet', 'Angular', 'MapLibre'],
      problem: 'A simple alarm on air temperature fires during every defrost cycle, when the cargo barely changes, and says nothing about many small excursions adding up. A delay at a changeover point can push a driver past their fatigue limit.',
      stagesHeading: 'The plan',
      stages: [
        design(BLUEPRINT_WRITTEN),
        firstRelease([
          setUp('check the cold-chain and fatigue rules'),
          step('planned', '1', 'Vehicle simulator and C# ingestion', 'The target event rate is sustained with dropped events counted, and the rate and hardware are recorded.'),
          step('planned', '2', 'Clean and analysis tables', 'Defrost tagging and fatigue clocks are tested on fixtures.'),
          step('planned', '3', 'Mean kinetic temperature and alarms', 'Worked-example tests pass, and a notebook compares naive and defrost-aware alarms on simulated trips.'),
          step('planned', '4', 'Map view and report', 'A playback demo runs locally.'),
        ]),
        extensions([
          'Refuelling detour recommendations using published station prices',
          'Fuel use against road grade',
          'Changeover swap matching',
          'Map matching of GPS traces',
          'Delivery-slot risk',
          'A tamper-evident audit pack for fatigue records'
        ])
      ]
    },
    {
      id: 'award-engine',
      title: 'AwardEngine',
      domain: 'Payroll compliance',
      tagline: 'Award-wage interpretation and pay audits for hospitality shifts.',
      flow: [
        { label: 'Shifts and award rules', detail: 'synthetic rosters; dated, cited rules' },
        { label: 'C# rules engine', detail: 'shifts to pay lines' },
        { label: 'Pay audit', detail: 'paid against owed, per shift' },
        { label: 'Notebook and Power BI', detail: 'variances and their causes' }
      ],
      description: 'Interprets Australian modern award rules for hospitality shifts and audits past pay against them, on synthetic venue data.',
      firstRelease: 'A rules engine for the Hospitality Industry (General) Award 2020, with shift times that stay correct across daylight saving, an audit of synthetic shifts, a notebook and a Power BI report.',
      status: 'Planned · not started',
      technologies: ['C# .NET', 'Python', 'DuckDB', 'Parquet', 'Power BI', 'Angular'],
      problem: 'Award rules interact and change every year, and small mistakes repeated over thousands of shifts become large underpayments. A 22:00 to 06:00 shift lasts 7 or 9 real hours on the nights the clocks change, yet payroll that subtracts clock times pays 8.',
      stagesHeading: 'The plan',
      stages: [
        design(BLUEPRINT_WRITTEN),
        firstRelease([
          setUp('check and cite every rule of the Hospitality Award', 'The gates pass, and every rule of the Hospitality Award is checked and cited.'),
          step('planned', '1', 'Time model and shift segmentation', 'Daylight-saving and midnight tests pass.'),
          step('planned', '2', 'Award pricing', 'Pay-guide and worked-example tests pass, and each pay line traces to the rules behind it.'),
          step('planned', '3', 'Synthetic shifts and the pay audit', 'The generator is documented and seeded, the variance tables are built, and the notebook runs clean.'),
          step('planned', '4', 'Power BI report', 'Each measure is documented.'),
        ]),
        extensions([
          'The General Retail Industry Award',
          'Single Touch Payroll Phase 2 pay-line categories',
          'PAYG withholding',
          'Super calculation and payment timing',
          'A roster optimiser',
          'A role-based web view for staff, managers, analysts and finance',
          'Further awards and enterprise agreements'
        ])
      ]
    },
    {
      id: 'valuation-engine',
      title: 'ValuationEngine',
      domain: 'Equity research',
      tagline: 'Point-in-time company valuations from SEC filings.',
      flow: [
        { label: 'SEC filings', detail: 'Company Facts and the Data Sets' },
        { label: 'Point-in-time store', detail: 'figures as first filed' },
        { label: 'Valuation core', detail: 'three statements, DCF, reverse DCF' },
        { label: 'Memos and research view', detail: 'valuations as of any date' }
      ],
      description: 'Normalises SEC filings into a point-in-time store, so that discounted-cash-flow and multiple-based valuations can be run as of any past date without using figures restated later.',
      firstRelease: 'A proof of concept on a fixed set of US companies: gather the data, then check feasibility before building further.',
      status: 'Design reviewed · not started',
      technologies: ['Python', 'Polars', 'DuckDB', 'Parquet', 'Quarto', 'React'],
      problem: 'The premise, to be checked against existing tools before any build work: valuation models are often built by copying line items from filings into spreadsheets, and restated figures can overwrite the originals, so a past valuation may use numbers that were not known at the time.',
      stagesHeading: 'The plan',
      stages: [
        design('Plan written and design-reviewed: the problem, data sources, design, phases and the evidence to collect.'),
        {
          short: 'Proof of concept',
          title: 'Proof of concept',
          state: 'planned',
          exit: 'A decision, on the results, on whether to go further.',
          steps: [
            step('planned', '0', 'Set up the repository, and compare existing tools', 'One passing test in CI, and a comparison of existing tools written with sources.'),
            step('planned', '1a', 'Gather the data', 'The company set is committed with each pick\'s reason before anything is valued, and both SEC feeds are loaded and joined.'),
            step('planned', '1b', 'Feasibility check', 'A written report against criteria set beforehand; then a decision to go on, change course or stop.'),
            step('planned', '2', 'Three-statement tables and health metrics', 'The statement tables are built, and the return and cash-cycle metrics pass their tests on the benchmark companies.'),
            step('planned', '3', 'Forecasts, DCF, reverse DCF and point-in-time valuation', 'A valuation as of any past date runs on the set, nightly and on demand.'),
          ]
        },
        {
          short: 'Wider scope',
          title: 'Wider scope',
          state: 'planned',
          summary: 'Only if the proof of concept holds up.',
          steps: [
            step('planned', '4', 'The wider US market'),
            step('planned', '5', 'IFRS filers on EDGAR'),
            step('planned', '6', 'Peer comparisons'),
            step('planned', '7', 'A research view and tear-sheets'),
            step('planned', '8', 'Probabilistic valuation'),
          ]
        }
      ]
    }
  ];
}
