// localStorage helpers for the v2 multi-layer game.

export function readPersonalBest(): number {
  try {
    return parseInt(localStorage.getItem('synapseV2PB') ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

export function savePersonalBest(value: number): void {
  try {
    localStorage.setItem('synapseV2PB', String(value));
  } catch {
    // Silent failure — storage may be unavailable
  }
}
