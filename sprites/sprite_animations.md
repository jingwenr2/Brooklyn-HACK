# Mogul Blocks — Sprite Animation Descriptions

Detailed visual descriptions for every sprite and animation in the game. Each description is written as a brief for AI image generation or a pixel artist.

**Global Rules:**
- All sprites are **32×32 pixels**
- Color palette: Cyberpunk-retro (deep purples, electric blues, neon greens, warm oranges)
- Style: Chunky pixel art, 2–4px outlines, limited to 16-color palette per sprite
- Sprite sheets: Horizontal strips, each frame is 32×32 side by side
- Idle animations: Loop seamlessly
- Transition animations: Play once, end on the new level's first idle frame

---

## Properties

All 10 properties are buildings in "Pixel Park" — a gaming/tech-themed district. Each has 4 development levels (0–3), idle animations per level, and transition animations between levels.

---

### 1. Pixel Lofts *(Budget — $12,000)*

Small apartment complex for indie developers.

| Asset | Frames | Description |
|---|---|---|
| `level_0` | 1 | Empty dirt lot. Chain-link fence across the front. Faded "FOR SALE" sign tilted to the right. Scattered pixel weeds. Brown/gray earth tones. |
| `level_0_idle` | 2 | The "FOR SALE" sign sways slightly left-right. A single pixel bird lands and takes off from the fence post. |
| `level_1` | 1 | Small 2-story apartment block. Flat roof. 4 windows (2×2 grid). Plain beige walls with a single red door. Small satellite dish on roof. |
| `level_1_idle` | 2 | One window alternates between lit (warm yellow) and dark. Satellite dish blinks a tiny red light. |
| `level_2` | 1 | 3-story building. Freshly painted blue-gray walls. 6 windows, some with curtains. Rooftop antenna with small garden planter. "PIXEL LOFTS" sign in pixel font above door. |
| `level_2_idle` | 3 | Windows cycle through lit/dark patterns (suggests residents). A tiny pixel person walks past the ground-floor window. Rooftop planter sways. |
| `level_3` | 1 | 4-story modern loft building. Glass-front ground floor showing a bright co-working space. Neon "PIXEL LOFTS" sign in electric blue. Rooftop deck with pixel fairy lights. Solar panels on roof. |
| `level_3_idle` | 4 | Neon sign pulses gently. Multiple windows show activity (screens glowing, silhouettes moving). Fairy lights twinkle. Tiny drone flies from rooftop and returns. |
| `transition_0_1` | 3 | Frame 1: Dust cloud covers the lot. Frame 2: Scaffolding and crane visible through dust. Frame 3: Dust clears revealing completed Level 1 building. |
| `transition_1_2` | 3 | Frame 1: Workers on scaffolding (pixel hard hats). Frame 2: Building visibly taller, paint cans visible. Frame 3: Scaffolding removed, Level 2 complete. |
| `transition_2_3` | 3 | Frame 1: Construction crane lifting glass panels. Frame 2: Neon sign being installed (half-lit). Frame 3: Full reveal with neon sign lit, celebratory pixel confetti. |

---

### 2. Arcade Tower *(Budget — $15,000)*

Retro arcade and gaming lounge.

| Asset | Frames | Description |
|---|---|---|
| `level_0` | 1 | Abandoned lot with cracked pavement. Old broken arcade cabinet half-visible behind a dumpster. Faded graffiti on back wall. |
| `level_0_idle` | 2 | Arcade cabinet screen flickers weakly (green glow). A pixel rat scurries across the pavement. |
| `level_1` | 1 | Small single-story building. Simple sign reading "ARCADE" in blocky letters. One large window showing 2 arcade cabinets inside. Coin slot visible by the door. |
| `level_1_idle` | 2 | Arcade screens inside cycle colors (red, blue, green). Coin slot glints. |
| `level_2` | 1 | 2-story building. Full glass storefront packed with arcade machines. Upper floor has a "LOUNGE" sign with arrow. LED strip around the roofline in rainbow pattern. Pixel characters from classic games as window decals. |
| `level_2_idle` | 3 | LED strip cycles through rainbow colors. Arcade machines flash. A tiny pixel person enters through the front door. |
| `level_3` | 1 | 3-story neon palace. Giant pixel joystick sculpture on the roof. Full wrap neon signage "ARCADE TOWER" in hot pink and electric blue. Ground floor: bustling arcade. Floor 2: VR pods visible. Floor 3: rooftop bar with pixel cocktail sign. |
| `level_3_idle` | 4 | Rooftop joystick rotates slightly. Neon signs alternate flash patterns. Crowd of tiny pixel people visible through windows. Occasional pixel lightning bolt effect from the VR floor. |
| `transition_0_1` | 3 | Frame 1: Bulldozer clears debris. Frame 2: Walls go up, arcade cabinets being carried in. Frame 3: "ARCADE" sign lights up. |
| `transition_1_2` | 3 | Frame 1: Second floor being built, crane visible. Frame 2: LED strips being installed around roof. Frame 3: Grand opening — pixel confetti and a small crowd. |
| `transition_2_3` | 3 | Frame 1: Giant joystick being crane-lifted to roof. Frame 2: Neon signs being wired (flickering). Frame 3: Full neon blaze, crowd cheering. |

---

### 3. Neon Garage *(Budget — $18,000)*

Underground indie game studio and co-working space.

| Asset | Frames | Description |
|---|---|---|
| `level_0` | 1 | Rusty garage door on a cement block building. Faded "SPACE AVAILABLE" flyer taped to the door. Oil stain on the driveway. |
| `level_0_idle` | 2 | Flyer flutters in wind. A pixel cat sits on the oil stain, licks paw. |
| `level_1` | 1 | Garage door replaced with glass. Inside: 2 desks with computer monitors. Small "NEON GARAGE" sticker on the window. Potted pixel cactus by the door. |
| `level_1_idle` | 2 | Monitor screens glow (alternating code green / game blue). Cactus bobs slightly. |
| `level_2` | 1 | Expanded to 2 units. Neon tube outline around garage entrance in green. Indoor: multiple workstations, a whiteboard, and a coffee machine. Second unit has a testing room with game controllers visible. |
| `level_2_idle` | 3 | Neon tube flickers then stabilizes. Coffee machine steams. A pixel developer walks between the two units. |
| `level_3` | 1 | Full building conversion. 2 stories. Giant neon pixel-art mural of a game character on the side wall. Ground floor: open-plan studio with 8 workstations. Upper: motion capture room with pixel stick figures. Rooftop: satellite uplink dish. |
| `level_3_idle` | 4 | Mural character's eyes blink. Screens flash with game footage. Motion capture stick figures dance. Dish rotates slowly. |
| `transition_0_1` | 3 | Frame 1: Garage door being removed, sparks fly. Frame 2: Desks and monitors carried in. Frame 3: Lights on, sticker applied. |
| `transition_1_2` | 3 | Frame 1: Wall being knocked through to next unit. Frame 2: Neon tubes being mounted. Frame 3: Neon flickers to life, developers high-five. |
| `transition_2_3` | 3 | Frame 1: Second floor construction, pixel crane. Frame 2: Mural being painted (half complete). Frame 3: Mural complete, grand opening with pixel champagne pop. |

---

### 4. Cloud9 Plaza *(Budget — $20,000)*

Cloud computing and SaaS startup hub.

| Asset | Frames | Description |
|---|---|---|
| `level_0` | 1 | Empty commercial lot. Concrete foundation visible. A single server rack sits abandoned and rusting in the corner. Tumbleweeds. |
| `level_0_idle` | 2 | Server rack's single LED blinks red weakly. Tumbleweed rolls across. |
| `level_1` | 1 | Small office building. Clean white walls. "CLOUD9" in blue font on modest sign. Single glass door. Through window: a few desks and a server closet. |
| `level_1_idle` | 2 | Server closet LEDs blink green rhythmically. Office light flickers once. |
| `level_2` | 1 | 2-story modern office. Glass facade. Cloud-shaped logo sign illuminated in soft blue. Ground floor: open office with standing desks. Second floor: server room visible through glass (blue LED glow). Pixel cloud shapes drift across the building facade. |
| `level_2_idle` | 3 | Cloud shapes drift slowly across facade. Server room pulses blue. A pixel delivery drone arrives at the roof. |
| `level_3` | 1 | 3-story data center campus. Massive "CLOUD9 PLAZA" holographic sign floating above roof. Ground: sleek lobby with pixel palm trees. Floor 2: packed open office. Floor 3: visible server farm with cooling vents steaming. Futuristic glass and steel aesthetic. |
| `level_3_idle` | 4 | Holographic sign has gentle wave animation. Server farm LEDs cascade in a wave pattern. Cooling vents release pixel steam puffs. Drone delivery lands and takes off. |
| `transition_0_1` | 3 | Frame 1: Construction crew laying walls. Frame 2: Server rack being wheeled in. Frame 3: "CLOUD9" sign turned on. |
| `transition_1_2` | 3 | Frame 1: Second floor going up, glass panels visible. Frame 2: Server racks being stacked. Frame 3: Cloud logo illuminates, celebration. |
| `transition_2_3` | 3 | Frame 1: Third floor and cooling infrastructure. Frame 2: Holographic sign being calibrated (glitchy). Frame 3: Sign stabilizes, full campus revealed. |

---

### 5. LAN House *(Mid — $28,000)*

Esports café and competitive gaming venue.

| Asset | Frames | Description |
|---|---|---|
| `level_0` | 1 | Boarded-up storefront. Old "INTERNET CAFÉ" sign with missing letters ("INT_R_ET C_FÉ"). Cobwebs on the door. |
| `level_0_idle` | 2 | One board creaks. A pixel spider descends from a cobweb and retracts. |
| `level_1` | 1 | Clean storefront. 8 gaming PCs visible through window, arranged in two rows. Simple "LAN HOUSE" sign in green LED font. Energy drink vending machine by the door. |
| `level_1_idle` | 2 | PC screens glow in alternating colors. Vending machine hums (tiny pixel vibration). |
| `level_2` | 1 | 2-story venue. Ground: 16 PCs with racing chairs. Stage area in the back with a small screen. Upper floor: streaming booth with camera light on. "LAN HOUSE" in large neon green, stylized like a gaming font. Pixel gaming posters in windows. |
| `level_2_idle` | 3 | Stage screen shows a match (pixel explosions). Stream booth red light blinks. Crowd of tiny pixel viewers on ground floor shift and cheer. |
| `level_3` | 1 | 3-story esports arena. Ground: pro-style gaming stations with sponsor logos. Floor 2: broadcast studio with pixel cameras and desk setup. Floor 3: VIP lounge with rooftop viewing deck. Giant LED scoreboard on the facade. Trophy case visible in lobby. |
| `level_3_idle` | 4 | Scoreboard numbers tick up. Broadcast studio has active camera movements. VIP deck has pixel partygoers. Confetti periodically bursts from the rooftop. |
| `transition_0_1` | 3 | Frame 1: Boards being ripped off, dust cloud. Frame 2: PCs being unboxed and set up. Frame 3: "LAN HOUSE" sign powers on, first player sits down. |
| `transition_1_2` | 3 | Frame 1: Upper floor construction. Frame 2: Neon sign being mounted. Frame 3: Grand opening tournament — pixel crowd gathers. |
| `transition_2_3` | 3 | Frame 1: Full renovation, third floor going up. Frame 2: LED scoreboard installed (test pattern). Frame 3: Opening night — scoreboard live, spotlights, crowd roars. |

---

### 6. Byte Market *(Mid — $32,000)*

Tech marketplace and hardware shop.

| Asset | Frames | Description |
|---|---|---|
| `level_0` | 1 | Empty retail space. Dusty display window. A single forgotten GPU box sits in the window. "LEASE AVAILABLE" sign. |
| `level_0_idle` | 2 | GPU box catches a glint of light. Dust motes float in the window. |
| `level_1` | 1 | Small tech shop. Window displays: keyboards, mice, headsets on stands. "BYTE MARKET" sign in digital green font. Cash register visible through door. |
| `level_1_idle` | 2 | Display items rotate on stands. Cash register dings (tiny sound wave pixel). |
| `level_2` | 1 | 2-story tech superstore. Ground: packed shelves and demo stations. Upper: repair lab and custom PC build area. Animated LED price ticker running across the building facade. Pixel shopping bags by the entrance. |
| `level_2_idle` | 3 | LED ticker scrolls text. Demo station screens change. Pixel customer enters with empty hands, exits with shopping bag. |
| `level_3` | 1 | 3-story tech megastore + innovation lab. Ground: Apple-store-style open layout with glowing product tables. Floor 2: drone testing area (nets visible). Floor 3: R&D lab with robot arms visible. Holographic "BYTE MARKET" sign. Pixel line of customers out the door. |
| `level_3_idle` | 4 | Holographic sign shifts colors. Robot arms move. A test drone flies inside floor 2 netting. Customer line shuffles forward. |
| `transition_0_1` | 3 | Frame 1: Cleaning and painting. Frame 2: Shelves and products being set up. Frame 3: Sign lights up, first customer enters. |
| `transition_1_2` | 3 | Frame 1: Expansion construction upward. Frame 2: LED ticker being installed. Frame 3: Ticker goes live, crowds arrive. |
| `transition_2_3` | 3 | Frame 1: Major renovation, third floor. Frame 2: Robot arms being installed. Frame 3: Grand re-opening, holographic sign, pixel fireworks. |

---

### 7. Polygon Heights *(Mid — $38,000)*

VR/AR and 3D modeling studio complex.

| Asset | Frames | Description |
|---|---|---|
| `level_0` | 1 | Vacant warehouse with geometric graffiti on the walls (triangles, polygons). Broken windows. A VR headset abandoned on the steps. |
| `level_0_idle` | 2 | VR headset screen flickers faintly. Graffiti triangle pulses with a faint glow. |
| `level_1` | 1 | Converted warehouse. Clean geometric exterior (triangular window panels). "POLYGON" in angular font. Inside: VR stations with people wearing headsets. Motion tracking cameras on ceiling. |
| `level_1_idle` | 2 | VR users sway slightly (reacting to VR world). Tracking cameras blink red. |
| `level_2` | 1 | 2-story studio with angular/geometric architecture (building itself looks polygonal). Ground: VR demo floor with 6 stations. Upper: 3D modeling suite with large monitors showing wireframes. Rotating 3D polygon sculpture on the roof. |
| `level_2_idle` | 3 | Roof sculpture rotates slowly. Wireframes on monitors shift. VR users react (one jumps, one ducks). |
| `level_3` | 1 | 3-story futuristic polygon building — the architecture IS the art. Triangular glass panels, impossible-looking geometry. Ground: immersive VR arena. Floor 2: holographic display room (visible holograms through windows). Floor 3: the "Polygon Lab" with visible AR projections spilling out of windows. |
| `level_3_idle` | 4 | AR projections float outside windows (pixel geometric shapes). Holograms shift inside floor 2. VR arena flashes with virtual explosions. Building itself seems to subtly shift its geometry. |
| `transition_0_1` | 3 | Frame 1: Warehouse walls being cleaned, triangular panels mounted. Frame 2: VR equipment being carried in. Frame 3: Sign on, first VR session start. |
| `transition_1_2` | 3 | Frame 1: Second floor with angular panels going up. Frame 2: Polygon sculpture helicopter-lifted to roof. Frame 3: Sculpture starts rotating, building complete. |
| `transition_2_3` | 3 | Frame 1: Radical reconstruction (the geometry changes). Frame 2: AR projectors being installed. Frame 3: Full futuristic reveal, AR shapes burst outward. |

---

### 8. Circuit Square *(Mid — $42,000)*

Chip design and hardware engineering campus.

| Asset | Frames | Description |
|---|---|---|
| `level_0` | 1 | Industrial lot with chain link fence. Old circuit board fragments scattered on the ground. A rusted "DANGER: HIGH VOLTAGE" sign. |
| `level_0_idle` | 2 | Sparks occasionally fly from an exposed wire. Circuit board fragments glint. |
| `level_1` | 1 | Clean industrial building. Reinforced walls. "CIRCUIT SQUARE" in monospaced font. Small clean room visible through reinforced glass. Ventilation system on roof. Green PCB-pattern trim around the building. |
| `level_1_idle` | 2 | Clean room lights cycle through UV blue. Ventilation fans spin. |
| `level_2` | 1 | 2-story fabrication facility. Ground: expanded clean room with visible wafer handling robots. Upper: design office with massive CAD displays. Building exterior has PCB trace patterns etched into panels that glow green at night. Cooling towers on roof. |
| `level_2_idle` | 3 | PCB traces on facade pulse with traveling light (like data flowing). Wafer-handling robot arm moves. Cooling tower releases pixel steam. |
| `level_3` | 1 | 3-story chip campus. Ground: advanced fab with robotic arms and laser etching (visible blue laser through window). Floor 2: design center with holographic chip models. Floor 3: testing lab with oscilloscope displays. Massive circuit-board-patterned LED wall across entire facade. |
| `level_3_idle` | 4 | LED wall displays flowing circuit animations. Laser flashes blue periodically. Holographic chip model rotates. Oscilloscope traces wave patterns on displays. |
| `transition_0_1` | 3 | Frame 1: Hazmat crew clearing the lot. Frame 2: Reinforced walls going up, clean room glass. Frame 3: PCB trim lights up green, facility online. |
| `transition_1_2` | 3 | Frame 1: Expansion, cooling towers being installed. Frame 2: PCB trace panels being mounted on exterior. Frame 3: Traces light up in sequence, facility expanded. |
| `transition_2_3` | 3 | Frame 1: Major construction, third floor. Frame 2: LED wall panels being tiled across facade. Frame 3: LED wall comes alive with circuit animation, campus complete. |

---

### 9. Streaming Station *(Premium — $60,000)*

Content creator HQ and streaming platform office.

| Asset | Frames | Description |
|---|---|---|
| `level_0` | 1 | Large vacant lot, former TV station. Satellite dish on the ground (fallen). Old antenna tower structure. "BROADCASTING" sign with half the bulbs burnt out. |
| `level_0_idle` | 2 | Remaining sign bulbs flicker randomly. Fallen dish wobbles in wind. |
| `level_1` | 1 | Converted studio building. "STREAMING STATION" in gradient purple-to-pink neon. Large window: visible streaming setup (ring light, camera, gaming chair, dual monitors). Small control room behind glass. |
| `level_1_idle` | 2 | Ring light pulses. Monitor shows a chat scrolling (pixel text). Control room screens change. |
| `level_2` | 1 | 2-story media complex. Ground: multiple streaming studios (3 visible through windows, each with different color ring lights). Upper: production office and editing suites. Rooftop: restored antenna tower, now with modern dish array. Subscriber count ticker on facade. |
| `level_2_idle` | 3 | Subscriber ticker counts up. Different studios cycle activity (one streams, one sets up, one reviews footage). Dish array slowly rotates. |
| `level_3` | 1 | 3-story streaming empire. Ground: main studio with audience seating visible. Floor 2: multi-studio pod setup (6 pods, each with unique color theme). Floor 3: executive suite and merch design room. Massive LED billboard on roof showing "LIVE NOW" with rotating streamer avatar. Full neon purple/pink glow on entire facade. |
| `level_3_idle` | 4 | LED billboard rotates between streamer avatars. Studio audience does wave animation. Pod studios all actively streaming (different colors active). "LIVE NOW" text pulses. Merch boxes being loaded onto a pixel truck at ground level. |
| `transition_0_1` | 3 | Frame 1: Old equipment being cleared, satellite dish uprighted. Frame 2: Streaming setup being installed (ring light carried in). Frame 3: Neon sign turns on, first stream goes live (pixel "LIVE" indicator). |
| `transition_1_2` | 3 | Frame 1: Upper floor construction, dish array being mounted. Frame 2: Multiple studios being outfitted. Frame 3: Subscriber ticker starts, all studios operational. |
| `transition_2_3` | 3 | Frame 1: Third floor construction, LED billboard being craned up. Frame 2: Billboard powering on (test pattern, then avatars). Frame 3: Full empire reveal, purple glow, pixel fireworks, "LIVE NOW" activated. |

---

### 10. Boss Level Manor *(Premium — $75,000)*

Luxury gaming mansion and flagship tech campus.

| Asset | Frames | Description |
|---|---|---|
| `level_0` | 1 | Huge empty estate lot. Wrought iron gates (locked). Overgrown pixel garden. An old stone fountain (dry). Crumbling wall remnants. Grand driveway leading to nothing. |
| `level_0_idle` | 2 | Gate chain clinks in wind. A pixel crow lands on the fountain and caws. |
| `level_1` | 1 | Manor foundation complete. 2-story stone and glass building. Grand entrance with double doors. "BOSS LEVEL" in gold pixel font on a stone plaque. 4 large windows. Manicured lawn replacing weeds. Fountain restored (water flowing). |
| `level_1_idle` | 2 | Fountain water sparkles. Windows glow warm gold. A pixel butler is visible in the doorway. |
| `level_2` | 1 | Expanded manor. 3-story mansion with west and east wings. Ground: grand lobby through glass doors, visible chandelier. East wing: visible gaming tournament room with 10 PC setups. West wing: boardroom with large screen. Helipad on roof with pixel helicopter. Pixel luxury cars in circular driveway. |
| `level_2_idle` | 3 | Chandelier sparkles. Tournament room screens flash with gameplay. Helicopter blades spin idle on helipad. A pixel luxury car arrives, tiny person exits. |
| `level_3` | 1 | Full tech campus estate. 4-story futuristic mansion with original stone facade blended with glass and neon gold accents. Ground: grand hall with holographic gaming displays visible. Floor 2: luxury suites. Floor 3: innovation lab with visible holographic table. Floor 4: penthouse with rooftop infinity pool (visible from side). Massive gold "BOSS LEVEL MANOR" sign with crown icon. Grounds: pixel Japanese garden, helipad, 3 luxury vehicles. |
| `level_3_idle` | 4 | Infinity pool water shimmers. Holographic displays cycle through game demos. Crown icon on sign rotates. Helicopter arrives/departs. Garden fountain has fish jumping. Innovation lab has pixel explosions (testing something). A red carpet leads from the gate. |
| `transition_0_1` | 3 | Frame 1: Massive construction site, cranes and cement trucks. Frame 2: Walls rising, fountain being rebuilt. Frame 3: Doors open, gold plaque placed, fountain starts flowing. |
| `transition_1_2` | 3 | Frame 1: Wings being added, major expansion. Frame 2: Helipad platform going up, helicopter arriving. Frame 3: Full manor revealed, pixel red carpet rolls out, luxury car arrives. |
| `transition_2_3` | 3 | Frame 1: Futuristic renovation, glass and gold panels being added. Frame 2: Infinity pool being filled, holographic displays tested. Frame 3: Grand reveal — gold sign with crown, fireworks, helicopter flyover, crowd of pixel people at the gates. |

---

## Effects

| Sprite | Frames | Speed | Loop | Description |
|---|---|---|---|---|
| `catalyst_boom` | 6 | 150ms/frame | No | Green shockwave expanding outward from center of district. Tiles briefly flash bright green. Upward-pointing arrows appear and float up. Fades to a soft green glow on final frame. |
| `catalyst_bust` | 6 | 150ms/frame | No | Red shockwave from center. Tiles flash red. Downward arrows fall. Rain drops begin. Final frame: persistent gray rain overlay on district. |
| `auction_gavel` | 4 | 120ms/frame | No | Wooden gavel rises, slams down, impact star burst, wood block bounces. Played over the disputed property. |
| `milestone_unlock` | 8 | 100ms/frame | No | Gold circle expands from center. Star particles burst outward. Each frame adds more particles. Frame 7-8: particles converge into the milestone icon (gear, chart, lightning bolt, etc). |
| `bankruptcy_warning` | 4 | 300ms/frame | Yes | Red border pulses around the portfolio panel. Intensity cycles: dim → bright → dim → brighter. Warning triangle icon blinks in corner. |
| `purchase_confirm` | 5 | 100ms/frame | No | Coin drops from top. Bounces once. Sparkle burst. Cash register "KA-CHING" text appears. Fades. |
| `research_reveal` | 6 | 120ms/frame | No | Magnifying glass slides in from left. Scans across the intel card. Glass flashes (found it!). Intel text fades in. Glass slides away. |
| `bluff_success` | 5 | 120ms/frame | No | Poker chip flips in air (3 rotation frames). Lands face-up with a star. Small pixel "GOTCHA" text pops above. |

---

## UI Elements

All UI elements are pixel art styled to match the game's retro aesthetic.

| Sprite | Size | Description |
|---|---|---|
| `btn_buy` | 48×16 | Green button with pixel coin icon + "BUY" text. Hover state: brighter green, coin bounces. Disabled state: grayed out. |
| `btn_develop` | 48×16 | Orange button with pixel wrench icon + "DEV" text. Hover: brighter, wrench wobbles. Disabled: gray. |
| `btn_research` | 48×16 | Blue button with pixel magnifying glass + "RESEARCH" text. Hover: glass sparkles. Disabled: gray. |
| `btn_end_turn` | 48×16 | Red button with pixel arrow-right + "END TURN" text. Hover: pulsing outline. |
| `btn_pause` | 16×16 | Pixel pause icon (two vertical bars). Hover: bars separate slightly. |
| `btn_bluff` | 48×16 | Purple button with pixel speech bubble + "ANNOUNCE" text. Hover: speech bubble inflates. |
| `icon_ap` | 16×16 | Lightning bolt icon — gold when available, gray when spent. |
| `icon_cash` | 16×16 | Stack of pixel dollar bills with "$" symbol. |
| `icon_debt` | 16×16 | Red chain link icon representing debt/mortgage. |
| `icon_rent` | 16×16 | Green arrow pointing into a pixel cash register. |
| `icon_intel` | 16×16 | Blue eye icon with concentric circles (radar feel). |
| `panel_bg` | 9-slice | Dark navy panel with 1px bright border (neon blue). 9-slice so it stretches to any size. Subtle pixel noise texture. |
| `tooltip_bg` | 9-slice | Darker panel with rounded pixel corners, 1px yellow border. |
| `heat_indicator` | 16×48 | Vertical thermometer with 5 segments. Empty = gray. Each segment fills with color: green → yellow → orange → red → pulsing red. Used to hint at upcoming catalysts. |
| `listing_preview` | 32×16 | Small placeholder card with "?" and building silhouette. Shows the tier color (green = budget, blue = mid, gold = premium). Used to preview upcoming property listings. |

---

## Rivals

### The Flipper (MVP)

| Sprite | Frames | Description |
|---|---|---|
| `flipper_idle` | 2 | Pixel character in a flashy suit (gold jacket, sunglasses). Stands with arms crossed. Frame 2: adjusts sunglasses. Smug expression. Short hair, cocky posture. |
| `flipper_action` | 3 | Frame 1: reaches into jacket. Frame 2: pulls out a "SOLD" sign. Frame 3: slaps sign down triumphantly. |
| `flipper_defeat` | 2 | Frame 1: Sunglasses crack. Frame 2: slumps shoulders, pixel sweat drops. |
| `flipper_portrait` | 1 | 48×48 close-up portrait. Gold jacket, dark sunglasses reflecting a dollar sign. Background: pixel city skyline. Used in the Rival Tracker panel. |

---

## District — Pixel Park

| Sprite | Description |
|---|---|
| `pixel_park_tile` | Base tile for the district grid. Dark asphalt with circuit-board trace lines running through it (electric blue). Each tile has subtle pixel binary text in the background. |
| `pixel_park_boom` | Bloom version — traces glow brighter, green data streams flow through the circuit lines. Background brightens. |
| `pixel_park_bust` | Bust version — traces go red and flicker. Some lines break (gap in circuit). Background darkens, pixel static noise overlay. |
| `pixel_park_bg` | Full district background panorama. Cityscape with neon signs, pixel skyscrapers, floating holographic game ads. Night sky with pixel stars. Cyberpunk palette: deep purple sky, neon accents. |
