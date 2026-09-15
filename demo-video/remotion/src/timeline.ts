import { SCENES } from './scenes';

export const FPS = 50;

const sec = (s: number) => Math.round(s * FPS);

export const TRANSITION_FRAMES = sec(0.35);

export const INTRO_EXIT_START = sec(1.0);
export const INTRO_EXIT_DUR = sec(0.4);

export const MOCKUP_START = sec(0.9);
export const MOCKUP_ENTRANCE_DUR = sec(0.6);
export const MOCKUP_EXIT_DUR = sec(0.75);

export const OUTRO_OVERLAP = sec(0.6);
export const OUTRO_HOLD = sec(2.6);
export const END_FADE = sec(0.4);

export const SCENE_TOTAL_FRAMES =
  SCENES.reduce((sum, s) => sum + s.durationInFrames, 0) -
  (SCENES.length - 1) * TRANSITION_FRAMES;

export const MOCKUP_END = MOCKUP_START + SCENE_TOTAL_FRAMES;
export const OUTRO_START = MOCKUP_END - OUTRO_OVERLAP;
export const TOTAL_DURATION = OUTRO_START + OUTRO_HOLD + END_FADE;
