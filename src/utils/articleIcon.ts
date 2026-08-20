export const LOGO_ICON = 'logo';

const TAG_ICON_MAP: Record<string, string> = {
  'espace': LOGO_ICON,
  'indie games': LOGO_ICON,
  'intelligence artificielle': 'ph-robot',
  'design graphique': 'ph-paint-brush',
  'design system': 'ph-circles-four',
  'design systems': 'ph-circles-four',
  'identité visuelle': 'ph-palette',
  'workflow créatif': 'ph-flow-arrow',
  'ux/ui design': 'ph-cursor-click',
  'design ux/ui': 'ph-cursor-click',
  'productivité': 'ph-lightning',
  'ux design': 'ph-cursor-click',
  'mobile-first': 'ph-device-mobile',
  'mobile': 'ph-device-mobile',
  'analyse critique': 'ph-magnifying-glass',
  'ogame': 'ph-game-controller',
  'ergonomie': 'ph-hand-pointing',
  'annonce': 'ph-megaphone',
  'développement': 'ph-code',
  'game design': 'ph-game-controller',
  'tailwind css': 'ph-code',
};

export function getArticleIcon(tags: string[], override?: string): string {
  if (override) return override;
  for (const tag of tags) {
    const icon = TAG_ICON_MAP[tag.toLowerCase()];
    if (icon) return icon;
  }
  return 'ph-article';
}
