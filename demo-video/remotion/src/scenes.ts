export interface Scene {
  id: string;
  src: string;
  label: string;
  durationInFrames: number;
}

// Durations are trimmed to match the converted clips in public/clips
// (see demo-video/README for how these were captured/encoded).
export const SCENES: Scene[] = [
  {
    id: 'hero',
    src: 'clips/01-hero.mp4',
    label: 'Le lancement officiel',
    durationInFrames: 279,
  },
  {
    id: 'block3d',
    src: 'clips/02-block3d.mp4',
    label: "Un arbre technologique en 3D",
    durationInFrames: 243,
  },
  {
    id: 'features',
    src: 'clips/03-features.mp4',
    label: 'Ressources, flotte et défenses',
    durationInFrames: 339,
  },
  {
    id: 'carousel',
    src: 'clips/04-carousel.mp4',
    label: 'Une interface claire, des mécaniques profondes',
    durationInFrames: 243,
  },
  {
    id: 'blog',
    src: 'clips/05-blog.mp4',
    label: 'Le blog Dynasty Nova',
    durationInFrames: 255,
  },
  {
    id: 'article',
    src: 'clips/06-article.mp4',
    label: 'Des guides pensés pour les joueurs OGame',
    durationInFrames: 315,
  },
];
