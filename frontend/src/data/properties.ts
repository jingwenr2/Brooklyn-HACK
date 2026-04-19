import type { GridPos, Property } from "../types/game";

const sprites = import.meta.glob<{ default: string }>(
  "../../../sprites/properties/*.png",
  { eager: true },
);

function spriteFor(filename: string): string {
  const key = Object.keys(sprites).find((k) => k.endsWith(`/${filename}`));
  if (!key) throw new Error(`Sprite not found: ${filename}`);
  return sprites[key].default;
}

// Order matches BOARD_POSITIONS below. Unlock schedule from architecture.md.
export const PROPERTIES: Property[] = [
  { id: "startup_lofts", name: "Startup Lofts", tier: "budget", baseValue: 6000, sprite: spriteFor("startup_lofts.png"), unlockTurn: 1 },
  { id: "trade_center", name: "Trade Center", tier: "budget", baseValue: 7000, sprite: spriteFor("trade_center.png"), unlockTurn: 1 },
  { id: "venture_place", name: "Venture Place", tier: "mid", baseValue: 12000, sprite: spriteFor("venture_place.png"), unlockTurn: 1 },
  { id: "capital_square", name: "Capital Square", tier: "mid", baseValue: 14000, sprite: spriteFor("capital_square.png"), unlockTurn: 3 },
  { id: "signal_tower", name: "Signal Tower", tier: "budget", baseValue: 8000, sprite: spriteFor("signal_tower.png"), unlockTurn: 5 },
  { id: "exchange_tower", name: "Exchange Tower", tier: "mid", baseValue: 16000, sprite: spriteFor("exchange_tower.png"), unlockTurn: 7 },
  { id: "mogul_tower", name: "Mogul Tower", tier: "premium", baseValue: 28000, sprite: spriteFor("mogul_tower.png"), unlockTurn: 9 },
  { id: "metro_spire", name: "Metro Spire", tier: "mid", baseValue: 18000, sprite: spriteFor("metro_spire.png"), unlockTurn: 12 },
  { id: "apex_plaza", name: "Apex Plaza", tier: "premium", baseValue: 38000, sprite: spriteFor("apex_plaza.png"), unlockTurn: 15 },
  { id: "market_block", name: "Market Block", tier: "budget", baseValue: 9000, sprite: spriteFor("market_block.png"), unlockTurn: 18 },
];

// 3-4-3 staggered diamond. Row 1 is the wide middle row.
export const BASE_POSITIONS: GridPos[] = [
  { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
  { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 },
  { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 },
];

export function shufflePositions(array: GridPos[]): GridPos[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
