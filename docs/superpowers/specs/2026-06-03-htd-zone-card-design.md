# HTD Zone Card — Design Spec

**Date:** 2026-06-03
**Status:** Approved
**Related integration:** https://github.com/theharshl/htd-home-assistant

---

## Overview

A custom Home Assistant Lovelace card for controlling a single HTD Lync 6/12 or MCA-66 zone. One card = one zone. Configuration is a zone picker in the card editor; all entity bindings are derived automatically from the selected zone.

---

## Entity Model

The HTD HA integration exposes 5 entities per zone:

| # | Entity type | Attributes controlled |
|---|-------------|----------------------|
| 1 | `media_player` | power (on/off), volume (0–60), mute, input source |
| 2 | `number` | treble (-12 to +12) |
| 3 | `number` | bass (-12 to +12) |
| 4 | `number` | balance (-12 to +12) |
| 5 | `switch` or `boolean` | Do Not Disturb (DND) |

**Dynamic entity handling:** If any entity is disabled, unavailable, or does not exist, its corresponding control is hidden from the card and the layout adjusts to fill the gap. A config option (`show_disabled: true`) will gray out missing controls instead of hiding them, for users who prefer a consistent layout.

---

## Card Configuration

The card editor exposes a **zone picker** — a single dropdown listing all available HTD zones by name. Selecting a zone auto-populates all 5 entity bindings. No manual entity configuration required.

Optional config keys:
- `zone` — (required) zone identifier
- `show_disabled` — (default: `false`) gray out rather than hide missing controls

---

## Visual Design

### Color Palette

| Role | Value |
|------|-------|
| Page/dashboard background | `#161616` |
| Card surface | `#252525` |
| Card border | `#2e2e2e` |
| Track background (slider) | `#2e2e2e` |
| Primary text | `#e0e0e0` |
| Muted text / labels | `#555555` |
| Active accent (blue) | `#4a8fff` |
| Active accent light | `#a0ccff` |
| DND accent (orange) | `#ff6030` |
| DND accent light | `#ffaa88` |

### Glow Language

Glow = active/on. No glow = off/inactive. This is the single consistent visual rule across the entire card.

**Toggle buttons (power, DND):** Use layered `box-shadow` to compensate for small element size and produce perceived brightness equivalent to a slider at maximum:
```
box-shadow:
  0 0  6px #4a8fffcc,   /* tight core */
  0 0 14px #4a8fff77,   /* mid halo   */
  0 0 22px #4a8fff33,   /* outer bloom */
  inset 0 0 6px #4a8fff33;
```

**Sliders:** Two-layer rendering:
1. **Glow layer** (behind): same width as fill, `filter: blur(4px)`, gradient pinned to track width:
   ```
   transparent 0%, transparent 25%, #4a8fff22 45%, #4a8fff77 70%, #4a8fffbb 100%
   ```
   Bloom appears only where color is opaque (the right/bright end). `background-size` set to track pixel width.
2. **Fill layer** (on top): crisp 4px bar, gradient pinned to track width:
   ```
   #4a8fff18 0%, #4a8fff44 28%, #4a8fff88 56%, #4a8fffbb 78%, #4a8fffee 100%
   ```
   No `box-shadow`.

Both layers' `background-size` is set to the measured track pixel width in JS on mount and resize so the gradient ramp never compresses or stretches with fill width.

**Powered-off state:** All glow — buttons, pills, slider fills, slider glow layers — transitions to zero. Achieved by toggling a `.powered-off` class on the card root element. Text and controls dim to `#333`–`#555`. Layout is preserved.

---

## Layout

```
┌─────────────────────────────────────┐
│  LIVING ROOM   [MUTE] [DND]  [⏻]  │  ← header: zone name + badges
├─────────────────────────────────────┤
│  ▼ Sonos Amp                        │  ← source selector
├─────────────────────────────────────┤
│  VOL  ████████████░░░░░░░░░░  32   │
│  BASS ████████████████████░░  +3   │
│  TREB ██░░░░░░░░░░░░░░░░░░░  −1   │
│  BAL  ██████████░░░░░░░░░░░   0   │
└─────────────────────────────────────┘
```

### Header
- Left: zone name (uppercase, `0.82rem`, `#e0e0e0`)
- Right: MUTE pill + DND pill + power circle button, `gap: 8px`, `gap: 16px` between name and badges
- MUTE pill: amber (`#ffbb30`) glow when muted, flat/invisible when unmuted
- DND pill: orange (`#ff6030`) glow when active, flat when inactive
- Power button: circular, blue glow when on, flat when off

### Source Selector
- Full-width row, `background: #2e2e2e`, rounded `7px`
- Uses a native `<select>` element styled to match card (native picker renders well on mobile/tablet)
- Shows current source name; chevron `▾` on right
- Displays up to 19 sources (HTD Lync12 maximum)
- Disabled/non-interactive when zone is powered off

### Sliders (VOL, BASS, TREB, BAL)
- Row: `[label 32px] [track flex-1] [value 26px]`
- Labels: uppercase, `0.63rem`, `#555`
- Track: `4px` tall, `#2e2e2e` background
- Values: right-aligned, `0.65rem`, `#7ab5ff` (blue), tabular numerals
- Signed display for BASS/TREB/BAL: `+3`, `−1`, `0`
- VOL range: 0–60 (integer)
- BASS/TREB/BAL range: −12 to +12 (integer)
- Sliders non-interactive when powered off (`pointer-events: none` on the range input; visual state handled by `.powered-off` CSS class on the card root)

---

## Behavior

| Action | Result |
|--------|--------|
| Tap power button | Toggles `media_player` on/off; all glow follows |
| Drag VOL slider | Calls `media_player.volume_set` |
| Change source | Calls `media_player.select_source` |
| Drag BASS slider | Calls the bass `number` entity service |
| Drag TREB slider | Calls the treble `number` entity service |
| Drag BAL slider | Calls the balance `number` entity service |
| Tap MUTE pill | Toggles `media_player` mute; amber glow when muted |
| Tap DND pill | Toggles the DND `switch`/`boolean` entity |
| Entity state change | Card re-renders reactively via `hass` object updates |

---

## Technical Approach

- **Framework:** Lit Element (standard for custom HA cards, used by most community cards)
- **Distribution:** Single-file `htd-zone-card.js`, registered as a custom element, loaded via HA's `configuration.yaml` resources
- **Card editor:** Implements `getConfigElement()` returning a Lit-based config panel with zone picker
- **Entity resolution:** Given a zone ID, derive entity IDs by querying `hass.states` for entities belonging to the HTD integration. The exact naming convention (e.g. `media_player.htd_zone_1`, `number.htd_zone_1_bass`) must be confirmed against the integration source at https://github.com/theharshl/htd-home-assistant before implementation begins. The zone picker should also be populated by scanning `hass.states` for all HTD `media_player` entities and presenting their friendly names.
- **State reactivity:** Standard HA card pattern — `set hass(hass)` triggers re-render when state changes
- **Glow layer sizing:** `ResizeObserver` on each slider wrap sets `background-size` on fill and glow layers to the measured pixel width, keeping the gradient ramp absolute

---

## Out of Scope (this card)

- Multi-zone / party mode control (future card)
- System-level HTD settings
- Mute toggle is included in the approved design (header pill, amber glow)
- Mobile-specific layout variations (card adapts to whatever column width HA assigns)
