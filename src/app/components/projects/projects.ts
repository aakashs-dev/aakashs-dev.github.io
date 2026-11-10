import { Component } from '@angular/core';
import { PROFILE } from '../../profile';

interface RoadmapProject {
  title: string;
  domain: string;
  description: string;
  firstRelease?: string;
  note?: string;
  status: string;
  technologies: string[];
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

  projects: RoadmapProject[] = [
    {
      title: 'TheNumbersGame',
      domain: 'Indian equities',
      description: 'A single-owner system being built for the National Stock Exchange through Zerodha\'s Kite Connect API: it captures the market data Kite streams, stores it for replay and research, backtests strategies in Python, and places orders behind risk controls that fail closed.',
      note: 'No real money is traded until a written readiness gate is met. The repository is private; I can walk you through it on request.',
      status: 'In progress · private',
      technologies: ['C# .NET', 'Python', 'React', 'DuckDB', 'Parquet', 'Arrow Flight'],
      requestLink: `mailto:${PROFILE.email}?subject=TheNumbersGame%20walkthrough`
    },
    {
      title: 'NEM-Pulse',
      domain: 'Australian electricity market',
      description: 'Turns AEMO\'s public five-minute dispatch files into a queryable data lake, to study when prices go negative, when regional prices separate, and how heavy the tail of price spikes is.',
      firstRelease: 'Twelve months of three dispatch tables across all regions, with a research notebook and a Power BI report.',
      status: 'Planned · not started',
      technologies: ['Python', 'Polars', 'DuckDB', 'Parquet', 'Power BI', 'Angular']
    },
    {
      title: 'CreditVector',
      domain: 'Credit risk',
      description: 'Stress-tests a synthetic Australian mortgage and small-business loan book under interest-rate, unemployment and house-price scenarios, and computes expected-credit-loss provisions in the style of AASB 9.',
      firstRelease: 'A seeded synthetic loan book, an arrears transition model, 12-month and lifetime expected-credit-loss calculations, a notebook and a Power BI report.',
      status: 'Planned · not started',
      technologies: ['Python', 'Polars', 'DuckDB', 'Parquet', 'Power BI', 'Angular']
    },
    {
      title: 'FleetPulse',
      domain: 'Fleet telemetry',
      description: 'Uses simulated vehicle data to check whether refrigerated cargo stayed within temperature limits on a linehaul trip, and whether drivers stay inside heavy-vehicle fatigue rules.',
      firstRelease: 'A seeded vehicle simulator, telemetry ingestion into a lake, defrost-aware temperature alarms, a fatigue-hours state machine and a map view.',
      status: 'Planned · not started',
      technologies: ['C# .NET', 'Python', 'DuckDB', 'Parquet', 'Angular', 'MapLibre']
    },
    {
      title: 'AwardEngine',
      domain: 'Payroll compliance',
      description: 'Interprets Australian modern award rules for hospitality shifts and audits past pay against them, on synthetic venue data.',
      firstRelease: 'A rules engine for the Hospitality Industry (General) Award 2020, with shift times that stay correct across daylight saving, an audit of synthetic shifts, a notebook and a Power BI report.',
      status: 'Planned · not started',
      technologies: ['C# .NET', 'Python', 'DuckDB', 'Parquet', 'Power BI', 'Angular']
    },
    {
      title: 'ValuationEngine',
      domain: 'Equity research',
      description: 'Normalises SEC filings into a point-in-time store, so that discounted-cash-flow and multiple-based valuations can be run as of any past date without using figures restated later.',
      firstRelease: 'A proof of concept on a fixed set of US companies: gather the data, then check feasibility before building further.',
      status: 'Design reviewed · not started',
      technologies: ['Python', 'Polars', 'DuckDB', 'Parquet', 'Quarto', 'React']
    }
  ];
}
