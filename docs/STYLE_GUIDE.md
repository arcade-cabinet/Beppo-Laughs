# Beppo Laughs - Style Guide

## Visual Identity

### Atmosphere
Victorian circus big top meets psychological horror. Think Monty Python's absurdist aesthetic crossed with silent film horror. Nothing is quite right - proportions are off, colors too saturated, shadows too deep.

## Color Palette

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Dark Sepia Black | `#1a1510` | Background, shadows |
| Aged Cream | `#c4a882` | Canvas walls, paper |
| Blood Red | `#8b0000` | Fear meter, accents |
| Tungsten Orange | `#ffaa55` | Primary lighting |

### Sanity Colors
| Meter | Normal | Critical |
|-------|--------|----------|
| Fear | `#8b0000` | `#ff0000` (pulsing) |
| Despair | `#00008b` | `#0000ff` (pulsing) |

### Atmospheric Colors
| State | Fog Color | Lighting Tint |
|-------|-----------|---------------|
| Sane | Warm amber `hsl(30, 40%, 20%)` | Tungsten orange |
| Mid-sanity | Sickly yellow | Desaturated |
| Low sanity | Greenish purple | Red/purple accents |

## Typography

### Font Stack
```css
--font-horror: 'Nosifer', cursive;     /* Titles, scary text */
--font-creepy: 'Creepster', cursive;   /* UI labels, prompts */
--font-mono: 'Roboto Mono', monospace; /* Technical, counters */
```

### Usage Guidelines
- **Nosifer**: Game title only, large sizes
- **Creepster**: Most UI text, medium sizes
- **Roboto**: Speed counter, technical info

## 3D Visual Style

### Lighting
- **Primary**: Flickering tungsten point lights (1-2 intensity)
- **Ambient**: Warm dim `#ffd4a0` at 0.15-0.3 intensity
- **Horror accents**: Blood red / purple spots at low sanity

### Materials
| Surface | Material Type | Key Properties |
|---------|--------------|----------------|
| Canvas walls | MeshStandardMaterial | Texture, roughness: 0.8 |
| Sawdust floor | MeshStandardMaterial | Texture, roughness: 0.9 |
| Metal (car) | MeshStandardMaterial | metalness: 0.4-0.8 |
| Glowing elements | MeshBasicMaterial | emissive colors |

### Fog
- Near: 12 → 2 (as sanity drops)
- Far: 35 → 15 (as sanity drops)
- Color shifts warm → sickly

## UI Design

### HUD Elements
- Minimal, non-intrusive
- Semi-transparent backgrounds (`bg-black/30`)
- Monospace fonts for counters
- Horror fonts for labels

### Touch Controls
- Large touch targets (minimum 44x44px)
- High contrast for visibility
- Subtle animations on press

### Button Styles
```css
/* Primary horror button */
.btn-horror {
  font-family: 'Creepster';
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* On hover/active */
.btn-horror:hover {
  border-color: #8b0000;
  color: #ff4444;
}
```

## Audio Design

### Sound Categories
| Type | Character | Implementation |
|------|-----------|----------------|
| Ambient | Oppressive drone | Continuous oscillators |
| Footsteps | Sawdust shuffling | Noise bursts |
| Laughs | Detuned, unsettling | Detuned oscillator stacks |
| Stingers | Jump scare | Sharp attack, reverb tail |

### Dynamic Audio
- Volume scales with proximity to danger
- Pitch/detune increases with fear
- Low-frequency rumble at high despair

## Animation Guidelines

### Movement
- **Camera bob**: Subtle (0.03 units) at speed
- **Fork prompts**: Pulse/glow animation
- **Sanity effects**: Shake intensity scales with sanity loss

### Transitions
- **Fade**: 300-500ms for scene changes
- **Pulse**: 1-2s cycle for glowing elements
- **Shake**: Quick bursts (100-200ms) for scares

### Easing
```typescript
// Use smooth interpolation
MathUtils.lerp(current, target, 0.1);  // Slow approach
MathUtils.lerp(current, target, 0.3);  // Quick response
```

## Accessibility Considerations

### Current Support
- High contrast UI elements
- Large touch targets
- Aria labels on interactive elements

### Future Improvements
- [ ] Color blind mode (patterns instead of color)
- [ ] Screen reader announcements for game events
- [ ] Reduced motion option
- [ ] Subtitles for audio cues

## Asset Guidelines

### Textures
- Resolution: 1024x1024 or 2048x2048 max
- Format: PNG for transparency, JPG for photos
- Style: Distressed, aged, imperfect

### Models (if added)
- Low poly aesthetic
- Baked lighting where possible
- glTF format preferred

### Videos
- MP4 with H.264 encoding
- Max 1080p resolution
- Web-optimized compression
