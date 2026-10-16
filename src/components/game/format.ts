/** `formatNumberCompact` du jeu (fr) : une décimale tronquée, suffixe k/M/B/T, sans séparateur. */
export function compact(value: number): string {
  const tiers = [
    { value: 1e12, suffix: 'T' },
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'k' },
  ];
  const tier = tiers.find((t) => Math.abs(value) >= t.value);
  const scaled = Math.trunc((tier ? value / tier.value : value) * 10) / 10;
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1, useGrouping: false }).format(scaled)}${tier?.suffix ?? ''}`;
}

/** `formatTime` du jeu : « 1h 12m 30s », `j` pour les jours. */
export function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const parts = [
    [Math.floor(seconds / 86400), 'j'],
    [Math.floor((seconds % 86400) / 3600), 'h'],
    [Math.floor((seconds % 3600) / 60), 'm'],
    [Math.floor(seconds % 60), 's'],
  ] as const;
  return parts.filter(([n]) => n > 0).map(([n, unit]) => `${n}${unit}`).join(' ');
}

/** `computeEnergyTier` : rouge au-delà de 100 % ou en déficit, orange dès 90 %. */
export function energyTone(usage: number, available: number): string {
  if (usage > 100 || available < 0) return 'text-red-400';
  if (usage >= 90) return 'text-orange-400';
  return 'text-green-400';
}
