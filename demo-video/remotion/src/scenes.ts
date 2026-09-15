export interface Scene {
  id: string;
  src: string;
  label: string;
  durationInFrames: number;
}

// Durations (in frames, at timeline.FPS) match the converted clips in
// public/clips, produced by capture/record.mjs + capture/convert.mjs.
export const SCENES: Scene[] = [
  {
    id: 'hero',
    src: 'clips/01-hero.mp4',
    label: 'Le lancement officiel',
    durationInFrames: 276,
  },
  {
    id: 'block3d',
    src: 'clips/02-block3d.mp4',
    label: 'Un arbre technologique en 3D',
    durationInFrames: 244,
  },
  {
    id: 'features',
    src: 'clips/03-features.mp4',
    label: 'Ressources, flotte et défenses',
    durationInFrames: 324,
  },
  {
    id: 'carousel',
    src: 'clips/04-carousel.mp4',
    label: 'Une interface claire, des mécaniques profondes',
    durationInFrames: 272,
  },
  {
    id: 'blog',
    src: 'clips/05-blog.mp4',
    label: 'Le blog Dynasty Nova',
    durationInFrames: 245,
  },
  {
    id: 'article',
    src: 'clips/06-article.mp4',
    label: 'Des guides pensés pour les joueurs OGame',
    durationInFrames: 292,
  },
];
