import { create } from "zustand";

interface GameStore {
  turn: number;
  ap: number | null;
  cash: number;
  netWorth: number;
  ownedPropertyIds: string[];
  diceModalOpen: boolean;

  setAP: (ap: number) => void;
  endTurn: () => void;
}

export const useGameStore = create<GameStore>()((set) => ({
  turn: 1,
  ap: null,
  cash: 22_000,
  netWorth: 22_000,
  ownedPropertyIds: [],
  diceModalOpen: true,

  setAP: (ap) => set({ ap, diceModalOpen: false }),
  endTurn: () =>
    set((s) => ({
      turn: Math.min(s.turn + 1, 20),
      ap: null,
      diceModalOpen: true,
    })),
}));
