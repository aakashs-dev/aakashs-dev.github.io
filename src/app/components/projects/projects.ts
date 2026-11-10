import { Component, signal } from '@angular/core';
import { PROFILE } from '../../profile';

interface RoadmapProject {
  id: string;
  title: string;
  domain: string;
  description: string;
  firstRelease?: string;
  note?: string;
  status: string;
  technologies: string[];
  // The plan shown when the card is opened. Taken from each project's blueprint or roadmap.
  problem: string;
  progress: string;
  nextSteps: string[];
  nextStepsHeading: string;
  repoLink?: string;
  requestLink?: string;
}

@Component({
  selector: 'app-projects',
  imports: [],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects {
  statusDate = 'November 2026';

  // One card is open at a time; null means all are closed.
  readonly openId = signal<string | null>(null);

  toggle(id: string): void {
    this.openId.set(this.openId() === id ? null : id);
  }

  projects: RoadmapProject[] = [
    {
      id: 'the-numbers-game',
      title: 'TheNumbersGame',
      domain: 'Indian equities',
      description: 'A single-owner system being built for the National Stock Exchange through Zerodha\'s Kite Connect API: it captures the market data Kite streams, stores it for replay and research, backtests strategies in Python, and places orders behind risk controls that fail closed.',
      note: 'No real money is traded until a written readiness gate is met. The repository is private; I can walk you through it on request.',
      status: 'In progress · private',
      technologies: ['C# .NET', 'Python', 'React', 'DuckDB', 'Parquet', 'Arrow Flight'],
      problem: 'Staying correct under real constraints: an undocumented byte order in the market-data feed, broker rate limits, partial fills, daily login tokens, exchange holidays, and stopping safely when something goes wrong.',
      progress: 'Phases 0 to 3 are done: governance, an audit of what is actually built, documentation tooling, and corrective design decisions. Phase 4, a code re-layout that changes no behaviour, is in progress.',
      nextStepsHeading: 'Next',
      nextSteps: [
        'Phase 5: bug fixes, each against an accepted design decision',
        'Phase 6: refactors',
        'Phase 7: the remaining documentation',
        'Live-readiness gate: written criteria, each met and evidenced, before any real money'
      ],
      requestLink: `mailto:${PROFILE.email}?subject=TheNumbersGame%20walkthrough`
    },
    {
      id: 'nem-pulse',
      title: 'NEM-Pulse',
      domain: 'Australian electricity market',
      description: 'Turns AEMO\'s public five-minute dispatch files into a queryable data lake, to study when prices go negative, when regional prices separate, and how heavy the tail of price spikes is.',
      firstRelease: 'Twelve months of three dispatch tables across all regions, with a research notebook and a Power BI report.',
      status: 'Planned · not started',
      technologies: ['Python', 'Polars', 'DuckDB', 'Parquet', 'Power BI', 'Angular'],
      problem: 'The data is public but awkward: zipped CSVs that mix several tables in one file, dispatch runs that are revised so an interval can appear more than once, and tens of millions of rows across five regions.',
      progress: 'Plan written; nothing built yet.',
      nextStepsHeading: 'After the first release',
      nextSteps: [
        'Pre-dispatch forecast error',
        'Battery revenue across the energy and FCAS markets',
        'Curtailment of wind and solar output',
        'Interconnector settlement residues',
        'Marginal emissions',
        'Generator bid analysis'
      ]
    },
    {
      id: 'credit-vector',
      title: 'CreditVector',
      domain: 'Credit risk',
      description: 'Stress-tests a synthetic Australian mortgage and small-business loan book under interest-rate, unemployment and house-price scenarios, and computes expected-credit-loss provisions in the style of AASB 9.',
      firstRelease: 'A seeded synthetic loan book, an arrears transition model, 12-month and lifetime expected-credit-loss calculations, a notebook and a Power BI report.',
      status: 'Planned · not started',
      technologies: ['Python', 'Polars', 'DuckDB', 'Parquet', 'Power BI', 'Angular'],
      problem: 'Lenders have to show how a loan book behaves when conditions worsen: how many borrowers fall behind and how fast, what that does to provisions, and whether funding covenants hold. The mechanics are well known but rarely shown end to end.',
      progress: 'Plan written; nothing built yet.',
      nextStepsHeading: 'After the first release',
      nextSteps: [
        'Fixed-rate reset and interest-only expiry shocks',
        'Prepayment',
        'Warehouse covenant stress',
        'A securitisation loss waterfall',
        'Regional collateral haircuts using ABS area data',
        'Climate hazard overlays',
        'An interactive scenario view'
      ]
    },
    {
      id: 'fleet-pulse',
      title: 'FleetPulse',
      domain: 'Fleet telemetry',
      description: 'Uses simulated vehicle data to check whether refrigerated cargo stayed within temperature limits on a linehaul trip, and whether drivers stay inside heavy-vehicle fatigue rules.',
      firstRelease: 'A seeded vehicle simulator, telemetry ingestion into a lake, defrost-aware temperature alarms, a fatigue-hours state machine and a map view.',
      status: 'Planned · not started',
      technologies: ['C# .NET', 'Python', 'DuckDB', 'Parquet', 'Angular', 'MapLibre'],
      problem: 'A simple alarm on air temperature fires during every defrost cycle, when the cargo barely changes, and says nothing about many small excursions adding up. A delay at a changeover point can push a driver past their fatigue limit.',
      progress: 'Plan written; nothing built yet.',
      nextStepsHeading: 'After the first release',
      nextSteps: [
        'Refuelling detour recommendations using published station prices',
        'Fuel use against road grade',
        'Changeover swap matching',
        'Map matching of GPS traces',
        'Delivery-slot risk',
        'A tamper-evident audit pack for fatigue records'
      ]
    },
    {
      id: 'award-engine',
      title: 'AwardEngine',
      domain: 'Payroll compliance',
      description: 'Interprets Australian modern award rules for hospitality shifts and audits past pay against them, on synthetic venue data.',
      firstRelease: 'A rules engine for the Hospitality Industry (General) Award 2020, with shift times that stay correct across daylight saving, an audit of synthetic shifts, a notebook and a Power BI report.',
      status: 'Planned · not started',
      technologies: ['C# .NET', 'Python', 'DuckDB', 'Parquet', 'Power BI', 'Angular'],
      problem: 'Award rules interact and change every year, and small mistakes repeated over thousands of shifts become large underpayments. A 22:00 to 06:00 shift lasts 7 or 9 real hours on the nights the clocks change, yet payroll that subtracts clock times pays 8.',
      progress: 'Plan written; nothing built yet.',
      nextStepsHeading: 'After the first release',
      nextSteps: [
        'The General Retail Industry Award',
        'Single Touch Payroll Phase 2 pay-line categories',
        'PAYG withholding',
        'Super calculation and payment timing',
        'A roster optimiser',
        'A role-based web view for staff, managers, analysts and finance',
        'Further awards and enterprise agreements'
      ]
    },
    {
      id: 'valuation-engine',
      title: 'ValuationEngine',
      domain: 'Equity research',
      description: 'Normalises SEC filings into a point-in-time store, so that discounted-cash-flow and multiple-based valuations can be run as of any past date without using figures restated later.',
      firstRelease: 'A proof of concept on a fixed set of US companies: gather the data, then check feasibility before building further.',
      status: 'Design reviewed · not started',
      technologies: ['Python', 'Polars', 'DuckDB', 'Parquet', 'Quarto', 'React'],
      problem: 'Valuation models are commonly built by copying line items from filings into spreadsheets, and many datasets overwrite original figures with restated ones, so a past valuation silently uses numbers that were not known at the time.',
      progress: 'Plan written and reviewed twice; nothing built yet.',
      nextStepsHeading: 'Phases',
      nextSteps: [
        'Phase 0: repository setup and a sourced comparison with existing tools',
        'Phase 1: gather the data, then a feasibility check before going further',
        'Phase 2: three-statement tables and financial health metrics',
        'Phase 3: forecasts, DCF, reverse DCF and point-in-time valuation, which ends the proof of concept',
        'Later, if the proof of concept holds up: the wider US market, IFRS filers, peer comparisons, a research view and probabilistic valuation'
      ]
    }
  ];
}
