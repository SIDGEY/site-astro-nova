export type BgVariant = 'surface' | 'surface-2' | 'tint-coral' | 'tint-blue';

const LEGACY_VARIANT_MAP: Record<string, BgVariant> = {
  base: 'surface',
  alt: 'surface-2',
  highlight: 'tint-coral',
};

const VALID_VARIANTS: BgVariant[] = ['surface', 'surface-2', 'tint-coral', 'tint-blue'];

function normalizeVariant(value?: string): BgVariant | undefined {
  if (!value || value === 'auto') {
    return undefined;
  }
  if (value in LEGACY_VARIANT_MAP) {
    return LEGACY_VARIANT_MAP[value];
  }
  if (VALID_VARIANTS.includes(value as BgVariant)) {
    return value as BgVariant;
  }
  return undefined;
}

function isSurfaceVariant(variant: BgVariant) {
  return variant === 'surface' || variant === 'surface-2';
}

export function computeBgVariants(blocks: any[], sectionVariants: string[] = []): BgVariant[] {
  let lastSurfaceVariant: BgVariant = 'surface-2';

  return blocks.map((block, index) => {
    const explicitVariant = normalizeVariant(block.variant || block.bgVariant);
    if (explicitVariant) {
      if (isSurfaceVariant(explicitVariant)) {
        lastSurfaceVariant = explicitVariant;
      }
      return explicitVariant;
    }

    const sectionVariant = normalizeVariant(sectionVariants[index]);
    if (sectionVariant) {
      if (isSurfaceVariant(sectionVariant)) {
        lastSurfaceVariant = sectionVariant;
      }
      return sectionVariant;
    }

    const nextVariant: BgVariant = lastSurfaceVariant === 'surface' ? 'surface-2' : 'surface';
    lastSurfaceVariant = nextVariant;
    return nextVariant;
  });
}
