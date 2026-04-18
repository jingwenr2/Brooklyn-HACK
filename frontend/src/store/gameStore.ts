import { create } from "zustand";
import { GridPos } from "../types/game";
import { BASE_POSITIONS, shufflePositions } from "../data/properties";

const API = "http://localhost:8000/api/game";
const SESSION = "default_session"; // Single-player MVP

interface GameStore {
  turn: number;
  ap: number | null;
  cash: number;
  debt: number;
  netWorth: number;
  ownedPropertyIds: string[];
  listedPropertyIds: string[];
  selectedPropertyId: string | null;
  boardPositions: GridPos[];
  unlockTurns: Record<string, number>;
  diceModalOpen: boolean;
  loading: boolean;

  // Actions
  initGame: () => Promise<void>;
  resumeGame: () => Promise<void>;
  rollAP: () => Promise<void>;
  selectProperty: (id: string | null) => void;
  buyProperty: () => Promise<void>;
  researchProperty: () => Promise<void>;
  endTurn: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export const useGameStore = create<GameStore>()((set, get) => ({
  turn: 1,
  ap: null,
  cash: 22_000,
  debt: 0,
  netWorth: 22_000,
  ownedPropertyIds: [],
  listedPropertyIds: [],
  selectedPropertyId: null,
  boardPositions: BASE_POSITIONS,
  unlockTurns: {},
  diceModalOpen: false,
  loading: false,

  initGame: async () => {
    // Randomize the property spawns first so the UI instantly lays them out
    const shuffled = shufflePositions(BASE_POSITIONS);
    localStorage.setItem("mogul_blocks_positions", JSON.stringify(shuffled));
    localStorage.setItem("mogul_blocks_save", "1");

    set({
      loading: true,
      turn: 1,
      ap: null,
      cash: 22_000,
      debt: 0,
      netWorth: 22_000,
      ownedPropertyIds: [],
      listedPropertyIds: [],
      selectedPropertyId: null,
      unlockTurns: {},
      boardPositions: shuffled,
    });
    
    // Also store game ID so we can support multiple later
    
    await fetch(`${API}/start/${SESSION}`, { method: "POST" });
    // Immediately start turn 1 to get AP + listings
    const res = await fetch(`${API}/${SESSION}/turn/start`, { method: "POST" });
    const data = await res.json();
    set({
      turn: data.turn,
      ap: null, // Don't set AP yet — let the dice modal handle it
      diceModalOpen: true,
      loading: false,
    });
    await get().refreshStatus();
  },

  resumeGame: async () => {
    set({ loading: true });
    const saved = localStorage.getItem("mogul_blocks_positions");
    if (saved) {
      set({ boardPositions: JSON.parse(saved) });
    }
    await get().refreshStatus();
    set({ loading: false });
  },

  rollAP: async () => {
    const res = await fetch(`${API}/${SESSION}/turn/start`, { method: "POST" });
    const data = await res.json();
    set({
      ap: data.ap,
    });
    await get().refreshStatus();
  },

  selectProperty: (id) => set({ selectedPropertyId: id }),

  buyProperty: async () => {
    const { selectedPropertyId, ap } = get();
    if (!selectedPropertyId || !ap || ap < 1) return;

    set({ loading: true });
    const res = await fetch(`${API}/${SESSION}/action/buy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ property_id: `${SESSION}_${selectedPropertyId}` }),
    });

    if (res.ok) {
      set({ selectedPropertyId: null });
      await get().refreshStatus();
    } else {
      const err = await res.json();
      alert(err.detail || "Cannot buy this property");
    }
    set({ loading: false });
  },

  researchProperty: async () => {
    const { selectedPropertyId, ap } = get();
    if (!selectedPropertyId || !ap || ap < 1) return;

    set({ loading: true });
    const res = await fetch(`${API}/${SESSION}/action/research`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ property_id: `${SESSION}_${selectedPropertyId}` }),
    });

    if (res.ok) {
      const data = await res.json();
      alert(`Intel on ${data.property}:\nValue: $${data.intel.market_value}\nRent/turn: $${data.intel.rent_per_turn}\nDev Level: ${data.intel.dev_level}`);
    } else {
      const err = await res.json();
      alert(err.detail || "Research failed");
    }
    await get().refreshStatus();
    set({ loading: false });
  },

  endTurn: async () => {
    set({ loading: true });
    const res = await fetch(`${API}/${SESSION}/turn/end`, { method: "POST" });
    const data = await res.json();

    if (data.game_over) {
      alert(data.victory ? "🏆 MOGUL VICTORY! You win!" : "Game Over!");
    }

    set({
      ap: null,
      diceModalOpen: true,
      selectedPropertyId: null,
      loading: false,
    });
    await get().refreshStatus();
  },

  refreshStatus: async () => {
    const res = await fetch(`${API}/${SESSION}/status`);
    if (!res.ok) return;
    const data = await res.json();
    set({
      turn: data.turn,
      cash: data.player.cash,
      debt: data.player.debt,
      netWorth: data.player.net_worth,
      ap: data.ap_remaining > 0 ? data.ap_remaining : get().ap,
      ownedPropertyIds: data.properties
        .filter((p: any) => p.owner_id === `${SESSION}_user`)
        .map((p: any) => p.id.replace(`${SESSION}_`, "")),
      listedPropertyIds: data.properties
        .filter((p: any) => p.is_listed)
        .map((p: any) => p.id.replace(`${SESSION}_`, "")),
      unlockTurns: data.properties.reduce((acc: Record<string, number>, p: any) => {
        acc[p.id.replace(`${SESSION}_`, "")] = p.unlock_turn;
        return acc;
      }, {}),
    });
  },
}));
