import { DIWALI_DATES } from '../../../services/theme.service';

export type MelbourneSeason = 'summer' | 'autumn' | 'winter' | 'spring';
export type FestivalId = 'christmas' | 'new-year' | 'diwali' | 'halloween';
export type SkylineHoliday = 'default' | FestivalId;
export type SkylineScene = MelbourneSeason | FestivalId;
export type SkylineSelection = 'auto' | SkylineScene;

export interface SkylineOption {
  readonly id: SkylineScene;
  readonly label: string;
}

export const SKYLINE_SCENE_OPTIONS: readonly SkylineOption[] = [
  { id: 'summer', label: 'Summer' },
  { id: 'autumn', label: 'Autumn' },
  { id: 'winter', label: 'Winter' },
  { id: 'spring', label: 'Spring' },
  { id: 'christmas', label: 'Christmas' },
  { id: 'new-year', label: 'New Year' },
  { id: 'diwali', label: 'Diwali' },
  { id: 'halloween', label: 'Halloween' },
];

function isWithinDayWindow(date: Date, month: number, day: number, radiusDays: number): boolean {
  const target = new Date(date.getFullYear(), month - 1, day);
  const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.abs(Math.round((current.getTime() - target.getTime()) / 86_400_000));
  return diffDays <= radiusDays;
}

/** Southern Hemisphere (Melbourne) meteorological seasons. */
export function resolveMelbourneSeason(date: Date = new Date()): MelbourneSeason {
  const month = date.getMonth() + 1;
  if (month === 12 || month <= 2) return 'summer';
  if (month <= 5) return 'autumn';
  if (month <= 8) return 'winter';
  return 'spring';
}

/**
 * Resolves active Melbourne festival window, or 'default' when no festival is in play.
 * - New Year: Dec 31 – Jan 2
 * - Christmas: Dec 1 – Dec 30
 * - Diwali: [day - 1, day + 1] from shared Melbourne Diwali table
 * - Halloween: Oct 30 – Oct 31
 */
export function resolveSkylineHoliday(date: Date = new Date()): SkylineHoliday {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 12 && day === 31) || (month === 1 && day <= 2)) {
    return 'new-year';
  }
  if (month === 12 && day <= 30) {
    return 'christmas';
  }
  const diwali = DIWALI_DATES[date.getFullYear()];
  if (diwali && isWithinDayWindow(date, diwali[0], diwali[1], 1)) {
    return 'diwali';
  }
  if (month === 10 && (day === 30 || day === 31)) {
    return 'halloween';
  }
  return 'default';
}

/** Resolves the automatic skyline scene: active festival window first, otherwise Melbourne season. */
export function resolveSkylineScene(date: Date = new Date()): SkylineScene {
  const holiday = resolveSkylineHoliday(date);
  return holiday === 'default' ? resolveMelbourneSeason(date) : holiday;
}

export function resolveSceneHoliday(scene: SkylineScene): SkylineHoliday {
  if (scene === 'christmas' || scene === 'new-year' || scene === 'diwali' || scene === 'halloween') {
    return scene;
  }
  return 'default';
}

export function resolveSceneSeason(scene: SkylineScene): MelbourneSeason {
  if (scene === 'christmas' || scene === 'new-year') return 'summer';
  if (scene === 'diwali' || scene === 'halloween') return 'spring';
  return scene;
}

export function isSkylineSelection(value: string): value is SkylineSelection {
  return value === 'auto' || SKYLINE_SCENE_OPTIONS.some((o) => o.id === value);
}

export function skylineSceneLabel(id: SkylineScene): string {
  return SKYLINE_SCENE_OPTIONS.find((o) => o.id === id)?.label ?? 'Autumn';
}
