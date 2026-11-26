import { Component, OnInit, inject, signal } from '@angular/core';
import { Layout } from './components/layout/layout';
import { TelemetryService } from './services/telemetry.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Layout],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly telemetry = inject(TelemetryService);
  protected readonly title = signal('portfolio');

  ngOnInit(): void {
    this.telemetry.init();
  }
}
