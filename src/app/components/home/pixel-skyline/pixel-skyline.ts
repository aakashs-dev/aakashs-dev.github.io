import { Component, computed, input } from '@angular/core';
import {
  MelbourneSeason,
  resolveSceneHoliday,
  resolveSceneSeason,
  resolveSkylineScene,
  SkylineHoliday,
  SkylineScene,
  SkylineSelection,
} from './skyline-overlays';

@Component({
  selector: 'app-pixel-skyline',
  standalone: true,
  templateUrl: './pixel-skyline.html',
  styleUrl: './pixel-skyline.scss',
})
export class PixelSkyline {
  /** User-selected overlay ('auto' follows the local Melbourne calendar & season). */
  readonly selection = input<SkylineSelection>('auto');

  /** Optional date override for deterministic calendar & season testing. */
  readonly date = input<Date | null>(null);

  readonly activeScene = computed<SkylineScene>(() => {
    const sel = this.selection();
    return sel === 'auto' ? resolveSkylineScene(this.date() ?? new Date()) : sel;
  });

  readonly activeHoliday = computed<SkylineHoliday>(() => resolveSceneHoliday(this.activeScene()));

  readonly activeSeason = computed<MelbourneSeason>(() => resolveSceneSeason(this.activeScene()));
}
