# Mogul Blocks — Game Design Plan

## One-Liner

A single-player real estate tycoon web game where pop culture knowledge is your competitive edge, and finance concepts are taught through mechanics — never lectures.

---

## Core Loop

Research the market → Anticipate catalysts → Position your capital → Collect returns → Reinvest.

At the start of each turn, the player **rolls a die** to determine their Action Points (2–5 AP). Limited AP forces constant tradeoffs — but the dice roll means you can never fully pre-plan. Every turn starts with a moment of tension.

---

## Turn Structure

Each game runs **20 turns**. A full session takes roughly 15-20 minutes.

### Action Menu

Actions are built out one phase at a time. Only MVP v1 actions ship in the first build.

| Action | AP Cost | Phase | What It Does |
|---|---|---|---|
| **Buy** | 1 | ✅ MVP v1 | Purchase an available property. Triggers auction if Flipper also wants it. |
| **Research** | 1 | ✅ MVP v1 | Answer a trivia question to reveal hidden upcoming market catalysts. Wrong answers return misleading intel. |
| **Develop** | 1 | ⏳ MVP v2 | Upgrade a property you own. Increases rent yield but costs cash. |
| Trade | 1 | 🔒 Phase 2 | Propose a swap or sale to an AI rival. |
| Bid | 2 | 🔒 Phase 2 | Compete for a premium tenant. |
| Sabotage | 2 | 🔒 Phase 2 | Disrupt a rival: bad reviews, rezoning, poaching. |

### Why Variable AP Works

**The dice roll:** At the start of every turn, roll 1d4+1 to get 2–5 AP. Minimum is always 2 (you can always Buy + Research). Maximum is 5 (rare — use it to make a big move).

- **2 AP (low roll):** Before you can act, a **penalty trivia question** fires automatically. Answer correctly → keep your cash, proceed with 2 AP. Answer wrong → lose **$4,000** AND proceed with only 2 AP. A bad roll is a double threat.
- **3 AP (average):** Comfortable. Buy + Research with 1 spare.
- **4–5 AP (high roll):** Opportunity. Double down, take a risk, race Flipper to a property.

The roll is the first thing that happens each turn. It's the heartbeat of the game — every turn starts with a reveal instead of a plan.

You cannot pre-plan a sequence. The dice forces reactive strategy: *what do I do with what I got?* This is closer to real investing than a fixed budget.

### Action Chaining (The Killer Loop)

Turn 1: Roll 4 AP → Research (trivia reveals "Tech district boom in 2 turns") + Buy cheap property in Tech + 2 AP saved
Turn 2: Roll 2 AP (low roll!) → only enough to Research again for more intel. Tension: Flipper's eyes appear on your target property.
Turn 3: Roll 5 AP → Buy the property before the catalyst hits. Boom fires. Rent spikes.

A player who skipped research reacts after the boom, not before. The dice roll variation means every path through these turns feels different.

---

## Tension Mechanics

These five systems create moment-to-moment pressure. Each one is a separate, stackable source of stress.

### 1. Property Expiry (FOMO)
Listed properties vanish after **5 turns** if nobody buys them. A small countdown badge on the tile (5 → 4 → 3 → 2 → 1 → gone) creates urgency every turn. You can't wait forever — sometimes you have to buy now even if your plan said later.

Stress testing showed 3-turn expiry was too punishing with the scaled property prices — key mid-range properties expired before the player accumulated enough rent income to afford them. 5 turns gives enough runway while keeping the pressure real.

Design note: Expired properties do not return. They're gone for the rest of the game. This also teaches scarcity.

### 2. Flipper Interest Indicator (Race Pressure)
When the Flipper AI has flagged a property as a buy target, that tile shows a small eyes icon 👀. You don't know when exactly it will act — just that it's watching. This creates a race: do you spend AP to buy now, or risk losing it to the Flipper?

On **Easy**, the eyes appear 2 turns before Flipper acts. On **Hard**, the eyes appear only 1 turn before — barely enough time to react.

### 3. Catalyst Dread (Unknown Direction)
The district heat indicator fills 1–2 turns before a catalyst fires, but **the direction (boom or bust) is hidden until it triggers.** You know something is coming — you don't know if it'll make you rich or wipe out your rent income.

Spending AP on Research is the only way to find out whether to buy in or sell out before it fires. This makes Research feel urgent, not optional.

### 4. Low-Roll Crisis (Penalty Question)
Rolling 2 AP triggers an **automatic trivia question** before the player can act. This isn't optional.

- **Correct answer:** Escape with cash intact. Proceed with 2 AP.
- **Wrong answer:** Lose **$1,000** AND proceed with 2 AP. Double punishment.

The penalty is fixed at $1,000 — roughly 4.5% of starting cash early game (stings but doesn't spiral), roughly 1% of a late-game portfolio. Stress testing showed $4,000 was catastrophic: two bad rolls in turns 1–2 effectively ended the game. $1,000 creates the same dread with survivable consequences.

One action button is greyed out during a 2-AP turn regardless of the trivia result. The trivia only determines whether you also lose money.

### 5. Cash Danger Mode (Visual Stress)
When the player's cash drops below one full turn of rent income, the entire UI border pulses red. This is not a warning tooltip — it's an environmental pressure cue that fills the screen.

At this point the player is one bad roll away from not being able to buy anything. The visual tells them before the numbers do.

---

## Information Asymmetry System (Trivia Integration)

Trivia is not a side minigame. It is the primary source of competitive advantage.

### Hidden Event Queue

Each game generates a queue of 3-5 upcoming catalyst events scheduled for future turns. Players cannot see them by default. Spending AP on Research (trivia) peels back the curtain.

### Trivia Difficulty Tiers

- **Easy question** — Reveals the district affected ("Something is happening in the Fashion district soon")
- **Medium question** — Reveals the direction ("Fashion district rents will increase")
- **Hard question** — Reveals magnitude and timing ("Fashion district +45% rent in 2 turns due to a celebrity flagship store opening")

### Wrong Answers

Wrong answers do not return nothing. They return **bad intel** — misleading information that could cause the player to misallocate capital. This creates real risk in the research action, mirroring how real due diligence can lead to incorrect conclusions.

### Content Sustainability

Events are generated from templates:

```
[Celebrity / Brand / Trend] + [moves into / leaves / boycotts] + [District] = [Rent effect]
```

50 templates generate thousands of unique combinations. Handcrafted trivia questions are reserved for rare "Insider Tip" events that give outsized alpha.

---

## AI Rival Archetypes

Four personality types that teach different strategies by opposing the player.

### The Flipper
- Buys cheap, sells at any profit, never develops
- Lesson: Flipping is fast but leaves long-term money on the table

### The Builder
- Buys and develops aggressively, uses heavy leverage
- Dominates in bull markets, gets wiped in downturns
- Lesson: The risk of over-leverage

### The Analyst
- Spends lots of AP on research, makes fewer but better-timed moves
- Lesson: The value of information and patience

### The Shark
- Sabotage-heavy, poaches tenants, plays politics
- Lesson: Defensive portfolio management and factoring in competitive threats

### Difficulty Scaling

- **Easy mode** — AI rivals react to catalysts 1-2 turns late
- **Hard mode** — AI rivals appear to have their own intel sources and move before the player

### Combination Meta

Each game features 2-3 rivals. Different combinations change the strategy required. Flipper + Shark feels very different from Builder + Analyst. This provides replay variety without needing multiplayer.

---

## Skill-Based Mechanics and Game Theory

### Sealed-Bid Auctions

When two players want the same property, both submit a hidden bid. Highest bid wins, but overpaying destroys ROI. Players learn the winner's curse by feeling it — not reading about it.

### Reputation System (Prisoner's Dilemma)

Trade offers to AI rivals can be fair or exploitative. Fair trades build reputation, making future deals easier. Lowball offers might work once, but the AI remembers and stops cooperating. This teaches that repeated games favor cooperation.

### Bluffing and Signaling

Before catalyst events, players can publicly "announce" plans ("I am going to develop heavily in the Sports district"). AI rivals react to announcements. Players can bluff — announce Sports, then buy Fashion while rivals pile into Sports. Teaches strategic misdirection and signaling.

---

## Finance Progression (Hidden Curriculum)

Finance concepts are never introduced as lessons. They are unlocked as tools when the player demonstrates mastery of the prerequisite behavior.

### Starting Cash & Property Prices

Players start with **$22,000**. Property prices are scaled to match:

| Tier | Price Range | Turn 1 rent (12% yield) |
|---|---|---|
| Budget | $5,000–$9,000 | $600–$1,080/turn |
| Mid | $10,000–$18,000 | $1,200–$2,160/turn |
| Premium | $25,000–$38,000 | $3,000–$4,560/turn |

**Why these numbers work (stress-tested):**
- Turn 1: Buy 2 budget properties (~$14K total) → $8K left. Tight but playable.
- Turn 3: Can afford first mid-range ($13K) after 2 turns of rent income. Real progression.
- Turn 9: First premium arrives. Player needs to save or use mortgage (turn 10) to get it.
- Turn 20: Skilled player hits ~$100K net worth. Victory condition is achievable but not guaranteed.

The old budget properties ($12–22K) against $22K starting cash meant Budget B always expired before the player could afford it — 5 dead turns with no decisions. Scaled prices fix this without giving the player too much money.

### Tier 1 — Cash Flow Basics (Turns 1-5)
- Buy properties, collect rent, pay expenses
- Player intuitively learns: revenue minus costs equals profit (NOI)
- No jargon on screen

### Tier 2 — Leverage (Unlocks around Turn 10)
- Mortgage option appears: borrow to buy more, but interest eats into cash flow
- Player learns that leverage amplifies both gains and losses
- Downturn events can trigger forced sales if over-leveraged

### Tier 3 — Valuation (Unlocks via skill milestones)
- **Win 3 auctions profitably** → Unlock "Comparable Analysis" (see recent sale prices of similar properties)
- **Survive a downturn without going bankrupt** → Unlock "Stress Testing" (preview portfolio performance under worst-case scenarios)
- **Predict 5 catalysts correctly via trivia** → Unlock "Trend Modeling" (see probability distributions on future events instead of point estimates)
- **Execute a profitable bluff** → Unlock "Market Manipulation" (spend AP to artificially inflate or deflate district hype for 1 turn)

### Tier 4 — Portfolio Management (Late Game / Prestige)
- Combine properties into portfolios
- See aggregate yield, concentration risk, sector exposure
- Unlock "Cap Rate" and "ROI" labels for metrics that were always on screen but unnamed

### Design Principle

The game never says "here is a lesson on comparable analysis." It says "you earned a new power." Labels for real finance concepts appear only after the player already understands the mechanic intuitively.

---

## City and District Design

### District Themes

| District | Culture Angle | Typical Catalysts |
|---|---|---|
| Hollywood | Film, TV, streaming | Blockbuster releases, award seasons, studio deals |
| Beatstreet | Music, concerts, nightlife | Album drops, festival announcements, artist residencies |
| Pixel Park | Gaming, esports, tech | Game launches, tournament hosting, tech company moves |
| Stadium Row | Sports, athletics | Championship runs, team relocations, draft picks |
| Trend Ave | Fashion, streetwear, beauty | Brand collabs, fashion weeks, influencer moves |
| Flavor Town | Food, restaurants, culinary | Chef openings, food trends, review surges |

### District Mechanics

- Each district has a base rent multiplier that shifts with catalysts
- Owning 3+ properties in one district gives a "Monopoly Bonus" (set completion, Monopoly-style)
- Districts can be rezoned via sabotage actions, changing their theme and value profile

---

## Dynamic Property Unlocks

The board shows **all 10 property plots from turn 1** arranged in a staggered 3-4-3 isometric diamond grid. Unavailable properties are **grayed out** — players can see the full layout but can only interact with unlocked (colored) tiles. Properties unlock in waves, un-graying as they become available.

**Starting state:** All 10 tiles visible, 3 in full color (2 budget, 1 mid), 7 grayed out.

**Unlock schedule (hardcoded, 10 total properties):**

| Turn | Unlocks | Running Total | What Appears |
|---|---|---|---|
| 1 | 3 | 3 | 2 budget, 1 mid |
| 3 | +1 | 4 | 1 mid |
| 5 | +1 | 5 | 1 budget |
| 7 | +1 | 6 | 1 mid |
| 9 | +1 | 7 | 1 **premium** (first one) |
| 12 | +1 | 8 | 1 mid |
| 15 | +1 | 9 | 1 **premium** |
| 18 | +1 | 10 | 1 budget (final listing) |

**Why this creates tension:**
- Players can see what's coming (grayed-out buildings are visible), creating FOMO and save-vs-spend pressure.
- The first premium property arrives at turn 9 — by then players have had time to save but may have spent on earlier properties. The reveal is a decision point: "Do I have enough to compete with Flipper for this?"
- Each unlock is a visual moment: the tile animates from gray to full color with a scale pop effect.
- Combined with property expiry (5 turns), unlocked properties feel precious.

**Multiplayer note:** Hardcoded schedule works for 1–2 players. Adjust unlock density for more players if multiplayer is added later.

---

## MVP Scope (Version 1)

### What Ships

- 1 city, 1 district (Pixel Park — gaming/tech theme), 10 properties
- Single screen, no scrolling map
- Dice AP per turn (1d4+1, range 2–5), 20-turn games
- 1 AI rival (The Flipper)
- **2 action types in v1: Buy + Research only** (Develop ships in v2)
- All 5 tension mechanics active from turn 1
- Property prices scaled: budget $5–9K, mid $10–18K, premium $25–38K
- Victory condition: **$100K net worth** after turn 10 with ≥3 properties, or beat Flipper at turn 20
- 5 catalyst event templates
- 2 finance tiers: cash flow basics + simple leverage (mortgage unlock at turn 10)
- No accounts, no leaderboards, no multiplayer
- Web-based, single-page React app

### What This Tests

Is the core loop of "research → anticipate → position → profit" fun on its own? If yes, layer in the remaining systems. If no, rework before building more.

### MVP Success Criteria

- Playtesters complete at least 3 full games without prompting
- Players can articulate (without being told) why research gave them an edge
- Average session length exceeds 10 minutes
- Players express desire for more districts, rivals, or actions

---

## Post-MVP Roadmap

### Phase 2 — Depth
- Add remaining 5 districts
- Add Trade and Sabotage actions
- Add 3 remaining AI archetypes (Builder, Analyst, Shark)
- Expand to 15 catalyst templates
- Unlock Tier 3 finance tools (comps, stress testing, trend modeling)

### Phase 3 — Social
- Multiplayer mode (2-4 players, async turn-based)
- Leaderboards (highest portfolio value, best ROI, longest win streak)
- Replay sharing (export a game as a shareable recap)

### Phase 4 — Meta
- Prestige system (restart with cosmetic unlocks and harder AI)
- Community-submitted trivia questions with voting/validation
- Seasonal content (real-world cultural events reflected in game catalysts)
- Mobile optimization

---

## Competitive Positioning

### The Gap

| Competitor | What It Does | What It Lacks |
|---|---|---|
| Monopoly GO | Gambling dopamine, board game skin | No skill, no learning, no strategy |
| Landlord Tycoon | Real-world map, property clicker | No strategic depth |
| Cashflow (Kiyosaki) | Educational board game | Dry, dated, no entertainment hook |
| Wall Street Survivor | Stock market simulator | No real estate, no culture layer |

### Mogul Blocks' Unique Angle

"The game that accidentally teaches you to think like an investor."

The only game where pop culture knowledge IS the alpha. No competitor connects "knowing which anime is trending" to "making a better investment decision."

### Target Audience

Young, culturally plugged-in people (18-28) who are curious about finance but will not sit through a course. They consume content on TikTok, Twitter/X, and YouTube. They play casual strategy games. They want to feel smart, not lectured.

### Distribution Strategy

- Host MVP on personal domain or itch.io
- Post gameplay clips on TikTok and Twitter/X showing "aha" moments (player spots catalyst, positions early, watches AI rivals panic)
- Finance Twitter and gaming Twitter rarely overlap — this lives in both feeds
- No marketing budget needed for validation. Organic shareability is the test.

---

## Technical Stack (Recommended)

- **Backend**: Python FastAPI (server-authoritative game state)
- **Frontend**: React + Vite + TypeScript (single-page app)
- **Visual style**: Pixel art — 1 static sprite per property, CSS star overlays for dev levels, all animations CSS/canvas
- **State management**: Zustand
- **AI rival logic**: Simple decision trees, no ML needed
- **Trivia/catalyst engine**: AI-generated via GPT-4o-mini with JSON fallback
- **Database**: SQLite for save/resume
- **Hosting**: Render/Railway (backend) + Vercel/Netlify (frontend)

---

## Open Questions

1. Should turn count be fixed (20) or should games end when a player hits a net worth target?
2. Should properties have visual upgrades (sprites change when developed) or is text/number UI sufficient for MVP?
3. How punishing should downturns be? Bankruptcy = game over, or just a setback?
4. Should the bluffing mechanic exist in single-player, or is it only meaningful against human opponents?
5. What is the right ratio of skill (trivia, auction strategy) vs. randomness (catalyst timing, property availability)?
