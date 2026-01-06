# Beppo Laughs - Game Asset Manifest

## Asset Strategy

Rather than procedurally generating infinite maze variations (wasteful), we design a **fixed, reusable library of visual components** that the deterministic maze algorithm combines. GenAI is used **only** for high-value video content (intro/outro).

## Reusable Visual Assets

### 1. Wall Textures (Procedurally Tiled)
- **Circus Tent Canvas** (existing) - Primary wall
- **Dark Hedge Wall** (exists, unused) - Alternative wall variant
- **Tattered Fabric** - Worn carnival cloth
- **Rusted Metal Grid** - Cage-like barrier
- **Weathered Wood Planks** - Carnival game booth wood

**Count: 5 wall texture variants**

### 2. Floor Textures (Seamlessly Tiling)
- **Circus Sawdust** (existing) - Primary floor
- **Dark Muddy Grass** (exists, unused) - Secondary variant
- **Worn Carnival Tile** - Checkerboard pattern
- **Blood-Stained Concrete** - Horror aesthetic
- **Creaky Wooden Boardwalk** - Carnival pier

**Count: 5 floor texture variants**

### 3. Obstacles (Interactive Game Elements)

#### Popup Obstacles
- **Inflatable Tubeman** - Wobbles on appearance
- **Punching Clown** - Arms swing on popup
- **Spring-Loaded Jester** - Bounces violently

#### Slide-Out Obstacles
- **Guillotine Blade** - Slides in from top
- **Spiked Door** - Slides in from side
- **Carousel Spike Ring** - Expands/spins inward

#### Drop-Down Obstacles
- **Hanging Chain** - Drops from ceiling
- **Cage Door** - Falls to block path
- **Net Curtain** - Drapes down blocking progress

**Count: 9 obstacle types with distinct animations**

### 4. Solution Items (Collectibles/Tools)

#### To solve obstacles, require corresponding items:

| Obstacle | Solution Item | Item Asset |
|----------|---------------|-----------|
| Inflatable Tubeman | Scissors | Paper cutout scissors |
| Punching Clown | Boxing Glove | Leather glove cutout |
| Spring Jester | Mallet | Carnival mallet |
| Guillotine | Safety Pin | Ornate pin |
| Spiked Door | Net | Carnival net |
| Carousel Spike | Hook | Fishing hook |
| Hanging Chain | Lamp/Light | Lantern cutout |
| Cage Door | Key | Large key (existing) |
| Net Curtain | Water Pitcher | Glass pitcher |

**Count: 9 solution items**

### 5. Environmental Cutouts (Backdrop Characters)

Non-interactive performers that enhance atmosphere:
- **Beppo Laughing** - Silent circus master overseeing
- **Audience Silhouettes** - Shadowy crowd
- **Tent Barker** - Carnival announcer
- **Clown Makeup Artist** - Creepy face painter
- **Ringmaster** - Menacing top-hatted figure
- **Creepy Carousel Horse** - Animated spinning horse
- **Tent Pole Clowns** - Performers on poles

**Count: 7 atmospheric characters**

## Video Assets (GenAI Generated)

### Intro Video
- **Duration**: 15-30 seconds
- **Content**: Surreal approach to circus grounds, Beppo emerging
- **Style**: Terry Gilliam collage animation mixed with live-action horror
- **Purpose**: Sets tone before gameplay

### Outro Video (Loss State)
- **Duration**: 5-10 seconds
- **Content**: Beppo's giant papier-mâché face laughing as player loses
- **Style**: Grotesque close-up, reality-bending horror
- **Purpose**: Game over screen video

### Future: Win Video
- **Duration**: 10-15 seconds
- **Content**: Player escaping as circus collapses into confetti
- **Style**: Surreal transformation, chaos and escape
- **Purpose**: Victory celebration (if implement win condition)

## Asset Counts Summary

```
Wall Textures:        5
Floor Textures:       5
Obstacles:            9
Solution Items:       9
Environmental Chars:  7
Existing Textures:    4 (to reuse)
Existing Videos:      1 (Beppo game over)
---
NEW Videos Needed:    2 (intro + outro)
```

## Implementation Priority

### Phase 1: Generate Video Assets (Using GenAI)
1. Intro video (Beppo emerging)
2. Outro video (Beppo laughing as player loses)

### Phase 2: Create Texture Assets (Design/Generate)
- 5 wall texture variants
- 5 floor texture variants

### Phase 3: Create 3D Models/Cutouts (GenAI)
- 9 obstacle models (popup/slide/drop variations)
- 9 solution item cutouts
- 7 atmospheric character cutouts

### Phase 4: Animation System
- Popup animations (0.4-0.6s)
- Slide-out animations (0.5-0.8s)
- Drop-down animations (0.6-1.0s)
- Solution animations (item pickup, obstacle removal)

## Asset Organization in Code

```
attached_assets/
├── generated_images/
│   ├── textures/
│   │   ├── wall_circus_tent.png
│   │   ├── wall_dark_hedge.png
│   │   ├── wall_tattered_fabric.png
│   │   ├── wall_rusted_metal.png
│   │   ├── wall_weathered_wood.png
│   │   ├── floor_sawdust.png
│   │   ├── floor_dark_grass.png
│   │   ├── floor_carnival_tile.png
│   │   ├── floor_blood_concrete.png
│   │   └── floor_boardwalk.png
│   ├── obstacles/
│   │   ├── popup_tubeman.png
│   │   ├── popup_clown.png
│   │   ├── popup_jester.png
│   │   ├── slide_guillotine.png
│   │   ├── slide_spiked_door.png
│   │   ├── slide_carousel.png
│   │   ├── drop_chain.png
│   │   ├── drop_cage.png
│   │   └── drop_net.png
│   ├── items/
│   │   ├── item_scissors.png
│   │   ├── item_boxing_glove.png
│   │   ├── item_mallet.png
│   │   ├── item_pin.png
│   │   ├── item_net.png
│   │   ├── item_hook.png
│   │   ├── item_lamp.png
│   │   ├── item_key.png
│   │   └── item_pitcher.png
│   └── characters/
│       ├── char_beppo.png
│       ├── char_audience.png
│       ├── char_barker.png
│       ├── char_makeup_artist.png
│       ├── char_ringmaster.png
│       ├── char_carousel_horse.png
│       └── char_tent_clowns.png
└── generated_videos/
    ├── intro_beppo_emerging.mp4
    ├── outro_beppo_laughing.mp4
    └── [future: win_escape.mp4]
```

## Code Changes Required

1. **Extend `client/src/game/textures.ts`**:
   - Add `WALL_TEXTURES` object with 5 variants
   - Add `FLOOR_TEXTURES` object with 5 variants
   - Add `OBSTACLE_ASSETS` with animation metadata
   - Add `SOLUTION_ITEMS` with mapping to obstacles

2. **Create `client/src/game/obstacles.ts`**:
   - Define obstacle types and animations
   - Export animation configuration per obstacle type

3. **Create `client/src/game/animation.ts`**:
   - Popup animation (ease-out-cubic, 0-0.6s)
   - Slide animation (ease-in-out, varies by direction)
   - Drop animation (ease-in, 0.6-1.0s)

4. **Update Maze component**:
   - Randomly select wall/floor textures per maze generation
   - Place obstacles at specific room junctions/deadends
   - Track which obstacles are solved

5. **Create Obstacles component**:
   - Render interactive obstacles in maze
   - Handle collision/solution detection
   - Trigger animations on player approach/interaction

## Benefits of This Approach

- ✅ Reusable assets across all game sessions
- ✅ Deterministic maze + random aesthetic combinations
- ✅ GenAI focused on high-impact video content
- ✅ Minimal asset redundancy
- ✅ Easier to expand with new wall/floor/obstacle types
- ✅ No waste on procedural generation

