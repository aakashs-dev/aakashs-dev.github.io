import { Component, computed, input } from '@angular/core';
import { SkylineHoliday } from '../pixel-skyline/skyline-overlays';
import { buildPixelTextPath } from './pixel-font';

const GREETINGS: Readonly<Record<Exclude<SkylineHoliday, 'default'>, string>> = {
  christmas: 'MERRY CHRISTMAS',
  'new-year': 'HAPPY NEW YEAR',
  diwali: 'HAPPY DIWALI',
  halloween: 'HAPPY HALLOWEEN',
};

export interface BlimpLayout {
  readonly text: string;
  readonly textPath: string;
  readonly bannerWidth: number;
  readonly bannerY: number;
  readonly craftY: number;
  readonly ropeX: number;
  readonly blimpX: number;
  readonly totalWidth: number;
  readonly viewHeight: number;
}

@Component({
  selector: 'app-pixel-blimp',
  standalone: true,
  templateUrl: './pixel-blimp.html',
  styleUrl: './pixel-blimp.scss',
})
export class PixelBlimp {
  readonly holiday = input.required<SkylineHoliday>();

  readonly layout = computed<BlimpLayout | null>(() => {
    const h = this.holiday();
    if (h === 'default') return null;
    const text = GREETINGS[h];
    const isTallCraft = h === 'christmas' || h === 'halloween' || h === 'diwali';
    const viewHeight = isTallCraft ? 22 : 16;
    const bannerY = isTallCraft ? 4 : 0;
    const craftY = h === 'christmas' || h === 'diwali' ? 3 : 0;
    // Pennant notch occupies x=0..2, inner padding x=3..4, bitmap text starts at x=5, y=bannerY+5 (5px tall).
    const built = buildPixelTextPath(text, 5, bannerY + 5);
    const bannerWidth = 5 + built.width + 3;
    const ropeX = bannerWidth;
    const blimpX = ropeX + 8;
    const craftWidth = h === 'christmas' ? 63 : h === 'diwali' ? 41 : h === 'halloween' ? 37 : 34;
    const totalWidth = blimpX + craftWidth;
    return {
      text,
      textPath: built.path,
      bannerWidth,
      bannerY,
      craftY,
      ropeX,
      blimpX,
      totalWidth,
      viewHeight,
    };
  });
}
