import { create } from "zustand";
import { GridPos } from "../types/game";
import { BASE_POSITIONS, shufflePositions } from "../data/properties";

const API = "http://localhost:8000/api/game";
const SESSION = "default_session"; // Single-player MVP

let toastId = 0;

export interface TriviaQuestion {
  question: string;
  options: string[];
  questionId: string;
  propertyId: string;
}

export interface GameOverData {
  victory: boolean;
  reason: string;
  netWorth: number;
  propertiesOwned: number;
  turnsPlayed: number;
}

export interface Toast {
  id: number;
  message: string;
  variant: "info" | "success" | "danger" | "warning";
}

export interface IntelEntry {
  id: number;
  turn: number;
  message: string;
}

export type OwnerRole = "YOU" | "FLIPPER" | null;

export interface PropertyMeta {
  listed: boolean;
  unlockTurn: number;
  expiryTurn: number | null;
  ownerRole: OwnerRole;
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
  isBankrupt: boolean;
  maxTurns: number;
  turnExpiresAt: number | null;
  flipperProps: number;
  flipperCash: number;
  ownedPropertyIds: string[];
  listedPropertyIds: string[];
  propertyMeta: Record<string, PropertyMeta>;
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
  activateTimer: () => Promise<void>;
  buyProperty: () => Promise<void>;
  developProperty: () => Promise<void>;
  researchProperty: () => Promise<void>;
  endTurn: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  // UI state
  triviaOpen: boolean;
  triviaQuestion: TriviaQuestion | null;
  pauseOpen: boolean;
  gameOverData: GameOverData | null;
  toasts: Toast[];
  setTriviaOpen: (open: boolean) => void;
  setPauseOpen: (open: boolean) => void;
  addToast: (message: string, variant?: Toast["variant"]) => void;
  dismissToast: (id: number) => void;
  intelLog: IntelEntry[];
  addIntel: (message: string) => void;
}

export const useGameStore = create<GameStore>()((set, get) => ({
  turn: 1,
  ap: null,
  cash: 22_000,
  debt: 0,
  netWorth: 22_000,
  isBankrupt: false,
  maxTurns: 20,
  turnExpiresAt: null,
  flipperProps: 0,
  flipperCash: 0,
  ownedPropertyIds: [],
  listedPropertyIds: [],
  propertyMeta: {},
  selectedPropertyId: null,
  boardPositions: BASE_POSITIONS,
  unlockTurns: {},
  diceModalOpen: false,
  loading: false,
  triviaOpen: false,
  triviaQuestion: null,
  pauseOpen: false,
  gameOverData: null,
  toasts: [],
  intelLog: [],

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
    if (!res.ok) throw new Error("Failed to roll Action Points");
    const data = await res.json();
    set({ ap: data.ap });
    await get().refreshStatus();
  },

  activateTimer: async () => {
    const res = await fetch(`${API}/${SESSION}/turn/activate_timer`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to activate timer");
    await get().refreshStatus();
  },

  selectProperty: (id) => set({ selectedPropertyId: id }),

  buyProperty: async () => {
    const { selectedPropertyId, ap, propertyMeta } = get();
    if (!selectedPropertyId || !ap || ap < 1) return;

    // Frontend safety check
    const meta = propertyMeta[selectedPropertyId];
    if (!meta || !meta.listed) {
      alert("This property is no longer available for purchase.");
      return;
    }

    set({ loading: true });
    const res = await fetch(`${API}/${SESSION}/action/buy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ property_id: `${SESSION}_${selectedPropertyId}` }),
    });

    if (res.ok) {
      set({ selectedPropertyId: null });
      await get().refreshStatus();
      get().addToast(`Property acquired: ${selectedPropertyId.replace(/_/g, " ")}`, "success");
    } else {
      const err = await res.json();
      get().addToast(err.detail || "Cannot buy this property", "danger");
    }
    set({ loading: false });
  },

  developProperty: async () => {
    const { selectedPropertyId, ap } = get();
    if (!selectedPropertyId || !ap || ap < 1) return;

    set({ loading: true });
    const res = await fetch(`${API}/${SESSION}/action/develop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ property_id: `${SESSION}_${selectedPropertyId}` }),
    });

    if (res.ok) {
      get().addToast("Property developed! Rent increased.", "success");
    } else {
      const err = await res.json();
      get().addToast(err.detail || "Cannot develop this property", "danger");
    }
    await get().refreshStatus();
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
      const msg = `${data.property} — Value $${data.intel.market_value}, Rent $${data.intel.rent_per_turn}/turn, Dev Lv${data.intel.dev_level}`;
      get().addToast(`Intel: ${msg}`, "info");
      get().addIntel(msg);
    } else {
      const err = await res.json();
      get().addToast(err.detail || "Research failed", "danger");
    }
    await get().refreshStatus();
    set({ loading: false });
  },

  endTurn: async () => {
    set({ loading: true });
    const res = await fetch(`${API}/${SESSION}/turn/end`, { method: "POST" });
    const data = await res.json();

    if (data.game_over) {
      set({
        gameOverData: {
          victory: Boolean(data.victory),
          reason: data.victory ? "Mogul Victory!" : "Game Over",
          netWorth: get().netWorth,
          propertiesOwned: get().ownedPropertyIds.length,
          turnsPlayed: get().turn,
        },
        loading: false,
      });
      return;
    }

    if (data.rent_collected) {
      get().addToast(`Rent collected: $${data.rent_collected.toLocaleString()}`, "success");
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
      isBankrupt: data.player.is_bankrupt,
      maxTurns: data.max_turns,
      turnExpiresAt: data.turn_expires_at,
      flipperCash: data.flipper.cash,
      flipperProps: data.properties.filter((p: any) => p.owner_id === flipperId).length,
      // Don't reveal AP while the dice modal is still up — let rollAP set it.
      ap: get().diceModalOpen ? get().ap : data.ap_remaining,
      propertyMeta: meta,
      ownedPropertyIds: data.properties
        .filter((p: any) => p.owner_id === userId)
        .map((p: any) => strip(p.id)),
      listedPropertyIds: data.properties
        .filter((p: any) => p.is_listed)
        .map((p: any) => strip(p.id.replace(`${SESSION}_`, ""))),
      unlockTurns: data.properties.reduce((acc: Record<string, number>, p: any) => {
        acc[p.id.replace(`${SESSION}_`, "")] = p.unlock_turn;
        return acc;
      }, {}),
    });
  },

  setTriviaOpen: (open) => set({ triviaOpen: open }),
  setPauseOpen: async (open) => {
    set({ pauseOpen: open });
    const endpoint = open ? "pause" : "resume";
    await fetch(`${API}/${SESSION}/${endpoint}`, { method: "POST" });
    await get().refreshStatus();
  },

  addToast: (message, variant = "info") => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts, { id, message, variant }] }));
    setTimeout(() => get().dismissToast(id), 4000);
  },

  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  addIntel: (message) =>
    set((s) => ({
      intelLog: [
        { id: s.intelLog.length + 1, turn: s.turn, message },
        ...s.intelLog,
      ],
    })),
}));
