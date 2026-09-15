import { SCENES } from './scenes';

export const FPS = 60;
export const TRANSITION_FRAMES = 20;

export const INTRO_EXIT_START = 60;
export const INTRO_EXIT_DUR = 24;

export const MOCKUP_START = 55;
export const MOCKUP_ENTRANCE_DUR = 34;
export const MOCKUP_EXIT_DUR = 45;

export const OUTRO_OVERLAP = 35;
export const OUTRO_HOLD = 150;
export const END_FADE = 24;

export const SCENE_TOTAL_FRAMES =
  SCENES.reduce((sum, s) => sum + s.durationInFrames, 0) -
  (SCENES.length - 1) * TRANSITION_FRAMES;

export const MOCKUP_END = MOCKUP_START + SCENE_TOTAL_FRAMES;
export const OUTRO_START = MOCKUP_END - OUTRO_OVERLAP;
export const TOTAL_DURATION = OUTRO_START + OUTRO_HOLD + END_FADE;
