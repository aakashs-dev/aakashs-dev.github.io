import { Component, computed, inject, signal } from '@angular/core';
import { TelemetryService } from '../../services/telemetry.service';
import { About } from '../about/about';
import { Certifications } from '../certifications/certifications';
import { Contact } from '../contact/contact';
import { Projects } from '../projects/projects';
import { Resume } from '../resume/resume';
import { HeroWeather } from './hero-weather/hero-weather';
import { PixelBlimp } from './pixel-blimp/pixel-blimp';
import { PixelSkyline } from './pixel-skyline/pixel-skyline';
import {
  isSkylineSelection,
  MelbourneSeason,
  resolveSceneHoliday,
  resolveSkylineScene,
  SKYLINE_SCENE_OPTIONS,
  SkylineHoliday,
  SkylineScene,
  skylineSceneLabel,
  SkylineSelection,
} from './pixel-skyline/skyline-overlays';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [About, Resume, Projects, Certifications, Contact, HeroWeather, PixelSkyline, PixelBlimp],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly telemetry = inject(TelemetryService);

  readonly skylineSelection = signal<SkylineSelection>('auto');
  readonly skylineOptions = SKYLINE_SCENE_OPTIONS;
  private readonly autoScene: SkylineScene = resolveSkylineScene();
  readonly autoSkylineLabel = skylineSceneLabel(this.autoScene);
  readonly activeSkylineScene = computed<SkylineScene>(() => {
    const sel = this.skylineSelection();
    return sel === 'auto' ? this.autoScene : sel;
  });
  readonly activeSkylineHoliday = computed<SkylineHoliday>(() =>
    resolveSceneHoliday(this.activeSkylineScene()),
  );
  readonly activeWeatherSeason = computed<MelbourneSeason | null>(() => {
    const scene = this.activeSkylineScene();
    return this.activeSkylineHoliday() === 'default' ? (scene as MelbourneSeason) : null;
  });

  onSkylineChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (isSkylineSelection(value)) {
      this.skylineSelection.set(value);
    }
  }

  onHeroCtaClick(sectionId: string): void {
    this.telemetry.track('section_view', sectionId);
  }
}
