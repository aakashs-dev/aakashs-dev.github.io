import { Component, input } from '@angular/core';
import { MelbourneSeason } from '../pixel-skyline/skyline-overlays';

export interface WeatherSprite {
  readonly x: number;
  readonly delay: number;
  readonly duration: number;
  readonly variant: 'a' | 'b' | 'c';
}

const AUTUMN_LEAVES: readonly WeatherSprite[] = [
  { x: 4, delay: -0.6, duration: 6.4, variant: 'a' },
  { x: 13, delay: -3.2, duration: 7.2, variant: 'b' },
  { x: 22, delay: -1.8, duration: 6.0, variant: 'c' },
  { x: 31, delay: -5.1, duration: 7.6, variant: 'a' },
  { x: 41, delay: -2.4, duration: 6.8, variant: 'b' },
  { x: 50, delay: -6.0, duration: 7.4, variant: 'c' },
  { x: 60, delay: -1.1, duration: 6.2, variant: 'a' },
  { x: 69, delay: -4.3, duration: 7.0, variant: 'b' },
  { x: 78, delay: -2.9, duration: 6.6, variant: 'c' },
  { x: 87, delay: -5.7, duration: 7.5, variant: 'a' },
  { x: 95, delay: -0.9, duration: 6.5, variant: 'b' },
];

const WINTER_FLAKES: readonly WeatherSprite[] = [
  { x: 3, delay: -0.8, duration: 6.2, variant: 'a' },
  { x: 11, delay: -4.1, duration: 7.8, variant: 'b' },
  { x: 19, delay: -2.0, duration: 6.6, variant: 'a' },
  { x: 27, delay: -5.4, duration: 8.2, variant: 'b' },
  { x: 35, delay: -1.3, duration: 6.9, variant: 'a' },
  { x: 44, delay: -6.2, duration: 7.5, variant: 'b' },
  { x: 52, delay: -3.0, duration: 6.4, variant: 'a' },
  { x: 61, delay: -0.4, duration: 8.0, variant: 'b' },
  { x: 69, delay: -4.8, duration: 6.7, variant: 'a' },
  { x: 77, delay: -2.5, duration: 7.6, variant: 'b' },
  { x: 86, delay: -5.9, duration: 6.5, variant: 'a' },
  { x: 94, delay: -1.7, duration: 7.9, variant: 'b' },
];

const SPRING_DROPS: readonly WeatherSprite[] = [
  { x: 4, delay: -0.2, duration: 1.55, variant: 'a' },
  { x: 11, delay: -1.1, duration: 1.85, variant: 'b' },
  { x: 18, delay: -0.6, duration: 1.65, variant: 'a' },
  { x: 25, delay: -1.4, duration: 1.95, variant: 'b' },
  { x: 32, delay: -0.4, duration: 1.45, variant: 'a' },
  { x: 39, delay: -1.2, duration: 1.75, variant: 'b' },
  { x: 47, delay: -0.8, duration: 1.6, variant: 'a' },
  { x: 54, delay: -1.5, duration: 1.9, variant: 'b' },
  { x: 61, delay: -0.3, duration: 1.5, variant: 'a' },
  { x: 68, delay: -1.0, duration: 1.8, variant: 'b' },
  { x: 75, delay: -0.7, duration: 1.65, variant: 'a' },
  { x: 82, delay: -1.6, duration: 1.95, variant: 'b' },
  { x: 89, delay: -0.5, duration: 1.55, variant: 'a' },
  { x: 96, delay: -1.3, duration: 1.85, variant: 'b' },
];

const SUMMER_RAYS: readonly WeatherSprite[] = [
  { x: 38, delay: -1.2, duration: 7.4, variant: 'c' },
  { x: 46, delay: -4.1, duration: 6.8, variant: 'b' },
  { x: 54, delay: -2.4, duration: 7.9, variant: 'c' },
  { x: 63, delay: -5.6, duration: 6.4, variant: 'b' },
  { x: 71, delay: -0.7, duration: 8.2, variant: 'c' },
  { x: 79, delay: -3.5, duration: 7.1, variant: 'b' },
  { x: 86, delay: -6.0, duration: 7.6, variant: 'c' },
  { x: 92, delay: -2.0, duration: 6.9, variant: 'b' },
];

@Component({
  selector: 'app-hero-weather',
  standalone: true,
  templateUrl: './hero-weather.html',
  styleUrl: './hero-weather.scss',
})
export class HeroWeather {
  readonly season = input.required<MelbourneSeason | null>();

  protected readonly leaves = AUTUMN_LEAVES;
  protected readonly flakes = WINTER_FLAKES;
  protected readonly drops = SPRING_DROPS;
  protected readonly sunSprites = SUMMER_RAYS;
}
