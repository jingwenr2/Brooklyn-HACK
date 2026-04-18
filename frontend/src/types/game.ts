export type Tier = "budget" | "mid" | "premium";

export interface Property {
  id: string;
  name: string;
  tier: Tier;
  baseValue: number;
  sprite: string;
  unlockTurn: number;
}

export interface GridPos {
  row: number;
  col: number;
}
