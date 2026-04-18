# Mogul Blocks — Sprite & Animation Descriptions

Visual descriptions for every sprite in the game. Property images are from the **Monocolor Buildings (Isometric) - Free** pack (400x400px PNGs, transparent backgrounds).

**Global Style:**
- All property sprites are isometric, monocolor (warm brown/orange/tan tones)
- 400x400px source images, scaled down in-game via CSS
- `image-rendering: pixelated` for crisp rendering at small sizes
- All animations (bob, glow, shake, particles) are handled by CSS/canvas

---

## Properties (10 sprites)

Each property is a single isometric building image. Development levels are shown via star overlays, not separate sprites.

### Budget Tier ($5K–$9K)

| # | Name | File | Visual Description |
|---|---|---|---|
| 1 | **Startup Lofts** | `startup_lofts.png` ← `(058).png` | Small, narrow sandstone tower. Plain facade with column-like vertical grooves and a grid of dark windows. Flat penthouse cap. Modest, no-frills — the cheapest plot on the board. |
| 2 | **Trade Center** | `trade_center.png` ← `(049).png` | Medium office building with a beige stone facade. Large reflective glass windows in a grid pattern. Dark flat rooftop with HVAC units. A step up from Startup Lofts — solid commercial real estate. |
| 3 | **Signal Tower** | `signal_tower.png` ← `(037).png` | Tall industrial tower in light beige. Smokestack and rooftop antenna visible. Many small windows in dense rows. Broadcast/data center vibe — utilitarian but profitable. |
| 4 | **Market Block** | `market_block.png` ← `(108).png` | Midrise building on a raised brown platform base. Clean cream/sand facade. Flat rooftop with skylights. Mixed-use retail and office — the best of the budget tier. |

### Mid Tier ($10K–$18K)

| # | Name | File | Visual Description |
|---|---|---|---|
| 5 | **Venture Place** | `venture_place.png` ← `(082).png` | Ornate orange/tan tower with stepped-back upper floors. Detailed window facade with decorative trim. Solar panel on penthouse. Pre-war elegance — where the VC money flows. |
| 6 | **Capital Square** | `capital_square.png` ← `(084).png` | Large corporate tower with a dark penthouse terrace. Many floors of dense windows. Warm orange-tan masonry. Institutional HQ look — banks and holding companies rent here. |
| 7 | **Exchange Tower** | `exchange_tower.png` ← `(125).png` | Art-deco influenced tower with a decorative crown/watchtower element. Strong vertical lines, dark lower floors. Commanding presence — where digital assets and equities are traded. |
| 8 | **Metro Spire** | `metro_spire.png` ← `(008).png` | Tallest mid-tier building. Dual-tone (orange lower, dark brown upper). Distinct angular roof with antennas. Many windows. Mixed-use luxury — penthouses above, offices below. |

### Premium Tier ($25K–$38K)

| # | Name | File | Visual Description |
|---|---|---|---|
| 9 | **Mogul Tower** | `mogul_tower.png` ← `(130).png` | Red-brick heritage tower with a distinctive copper dome/turret. Warm terracotta tones. Many floors. The flagship property — the one every player wants. Named after the game itself. |
| 10 | **Apex Plaza** | `apex_plaza.png` ← `(163).png` | The tallest building on the board. Deep orange facade with rooftop antenna array. Dense window grid. Imposing vertical presence. The endgame property — owning this means you're winning. |

---

## UI Elements (3 assets — SVGs)

| Sprite | Size | Description |
|---|---|---|
| **Star (filled)** | `star_filled.svg` | Vector SVG star. Gold fill (`#FFD700`) with a dark brown stroke (`#7A4F00`). Used to build the development level indicator shown below each property. |
| **Star (empty)** | `star_empty.svg` | Vector SVG star. Dark gray fill (`#3A3A4A`) with a subtle darker stroke (`#222230`). Represents an unused/available development slot. |
| **Board background** | `board_bg.svg` | Isometric diamond pattern tile. Brown tones (`#3D2410`, `#2A1A10`). Repeated under the properties to create the road/ground texture for the main game board grid. |

---

## Rival (1 asset — SVG)

| Sprite | Size | Description |
|---|---|---|
| **The Flipper** | `flipper.svg` | Pixel art character portrait rendered as an SVG. Features pixel blocks representing a face with glowing yellow glasses/eyes on a dark background. Used in the RivalCard panel. |

---

## CSS Animations (no sprites needed)

All visual effects are implemented in CSS keyframes and canvas particle systems.

| Animation | CSS Implementation |
|---|---|
| **Tile idle bob** | `@keyframes bob { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-2px) } }` — 2s loop on available tiles |
| **Unlock reveal** | `transition: filter 0.5s, opacity 0.5s, transform 0.3s` — grayscale(0) + opacity(1) + scale pop |
| **Purchase badge** | `@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }` — owner badge slides in |
| **Star add** | `@keyframes starPop { 0% { transform: scale(0) } 60% { transform: scale(1.3) } 100% { transform: scale(1) } }` |
| **Catalyst boom** | `box-shadow: 0 0 20px 5px rgba(0,255,0,0.6)` + `@keyframes shake { translateX(±2px) }` on affected tiles |
| **Catalyst bust** | `box-shadow: 0 0 20px 5px rgba(255,0,0,0.6)` + canvas rain particles falling over tiles |
| **Expiry pulse** | `@keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }` on countdown badge |
| **Cash danger** | `@keyframes dangerPulse { 0%, 100% { border-color: transparent } 50% { border-color: red } }` on game border |
| **Dice roll** | `@keyframes spin { to { transform: rotateX(360deg) rotateY(360deg) } }` on pixel die element |
| **Tile gray (expired)** | `transition: filter 1s` — grayscale(1) + opacity(0.4) fade |
| **Gold sparkle (dev)** | Canvas: 8-12 gold pixel squares at star position, random velocity, fade out over 500ms |
| **Rain (bust)** | Canvas: blue 1px lines falling at 60°, random x positions, reset at bottom |
