import { create } from "zustand";

const API = "http://localhost:8000/api/game";
const SESSION = "default_session"; // Single-player MVP

export type OwnerRole = "YOU" | "FLIPPER" | null;

export interface PropertyMeta {
  listed: boolean;
  unlockTurn: number;
  expiryTurn: number | null;
  ownerRole: OwnerRole;
  flipperTarget: boolean;
  flipperAcquireTurn: number | null;
  marketValue: number;
  rentValue: number;
  devLevel: number;
}

interface GameStore {
  turn: number;
  ap: number | null;
  cash: number;
  debt: number;
  netWorth: number;
  ownedPropertyIds: string[];
  listedPropertyIds: string[];
  propertyMeta: Record<string, PropertyMeta>;
  selectedPropertyId: string | null;
  diceModalOpen: boolean;
  loading: boolean;

  // Actions
  initGame: () => Promise<void>;
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
  propertyMeta: {},
  selectedPropertyId: null,
  diceModalOpen: false,
  loading: false,

  initGame: async () => {
    set({ loading: true });
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

  rollAP: async () => {
    const res = await fetch(`${API}/${SESSION}/turn/start`, { method: "POST" });
    const data = await res.json();
    set({ ap: data.ap });
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

    const userId = `${SESSION}_user`;
    const flipperId = `${SESSION}_flipper`;
    const strip = (id: string) => id.replace(`${SESSION}_`, "");

    const meta: Record<string, PropertyMeta> = {};
    for (const p of data.properties) {
      const short = strip(p.id);
      let ownerRole: OwnerRole = null;
      if (p.owner_id === userId) ownerRole = "YOU";
      else if (p.owner_id === flipperId) ownerRole = "FLIPPER";
      meta[short] = {
        listed: p.is_listed,
        unlockTurn: p.unlock_turn,
        expiryTurn: p.expiry_turn,
        ownerRole,
        flipperTarget: Boolean(p.is_flipper_target),
        flipperAcquireTurn: p.flipper_acquire_turn,
        marketValue: p.market_value,
        rentValue: p.rent_value,
        devLevel: p.dev_level,
      };
    }

    set({
      turn: data.turn,
      cash: data.player.cash,
      debt: data.player.debt,
      netWorth: data.player.net_worth,
      // Don't reveal AP while the dice modal is still up — let rollAP set it.
      ap: get().diceModalOpen ? get().ap : data.ap_remaining,
      propertyMeta: meta,
      ownedPropertyIds: data.properties
        .filter((p: any) => p.owner_id === userId)
        .map((p: any) => strip(p.id)),
      listedPropertyIds: data.properties
        .filter((p: any) => p.is_listed)
        .map((p: any) => strip(p.id)),
    });
  },
}));
