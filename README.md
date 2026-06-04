# htd-ha-card

A custom Home Assistant dashboard card for controlling a single HTD (Home Theater Direct) whole-home audio zone. Built with LitElement, designed for the HTD Lync 6/12 and MCA-66 systems via the [htd-home-assistant](https://github.com/theharshl/htd-home-assistant) integration.

## Screenshots

_Coming soon_

## Features

- **Power** — on/off toggle per zone
- **Volume** — slider (0–60), with live local state during drag
- **Source selection** — dropdown populated from the media player's source list
- **Mute** — MUTE pill toggle
- **Do Not Disturb** — DND pill toggle (switch entity)
- **EQ controls** — Bass, Treble, and Balance sliders (−12 to +12)
- **Visual polish** — gradient fill and animated glow on each slider that track the current value; powered-off state dims all controls
- **UI editor** — zone picker auto-populated with HTD zones detected from the entity registry

> **Current release:** one zone per card instance. Add one card per zone to your dashboard.

## Requirements

- [htd-home-assistant](https://github.com/theharshl/htd-home-assistant) — Home Assistant custom integration for HTD systems
- Home Assistant 2023.x or later (entity registry `platform` attribute required for zone detection)

## Manual Installation

1. Download `dist/htd-zone-card.js` from this repository.

2. Copy it to your Home Assistant `www` directory:
   ```
   config/www/community/htd-zone-card/htd-zone-card.js
   ```
   Create the `community/htd-zone-card/` folders if they don't exist.

3. Add it as a dashboard resource. In Home Assistant go to:
   **Settings → Dashboards → ⋮ menu → Resources → Add Resource**

   | Field | Value |
   |-------|-------|
   | URL | `/local/community/htd-zone-card/htd-zone-card.js` |
   | Resource type | JavaScript module |

4. Reload your browser (hard refresh / Ctrl+Shift+R).

## Adding the Card

### Via UI editor

1. Edit a dashboard and add a new card.
2. Search for **HTD Zone Card**.
3. Select the zone from the dropdown — it lists all media player entities provided by the HTD integration.

### Via YAML

```yaml
type: custom:htd-zone-card
zone: media_player.zone_1
```

### Config options

| Key | Required | Default | Description |
|-----|----------|---------|-------------|
| `zone` | Yes | — | Entity ID of the HTD zone media player (e.g. `media_player.zone_1`) |
| `show_disabled` | No | `false` | Show greyed-out placeholders for controls whose entities don't exist or are disabled |

## How It Works

### Entity resolution

The card takes the configured `zone` entity ID (e.g. `media_player.zone_1`) and derives the zone number from it. It then resolves the remaining entities automatically — no manual entity configuration needed:

| Control | Entity resolved |
|---------|----------------|
| Power, volume, mute, source | `media_player.zone_N` (your configured zone) |
| Bass | `number.bass` / `number.bass_N` |
| Treble | `number.treble` / `number.treble_N` |
| Balance | `number.balance` / `number.balance_N` |
| DND | `switch.NN_*_dnd` (located via entity registry `platform: htd`) |

Zone 1 uses no suffix; zones 2 and above use `_N` (e.g. `number.bass_2`). DND is located by scanning the entity registry for a switch entity with the correct zone number prefix and `platform: htd`.

### Missing or disabled entities

Controls whose entities do not exist in Home Assistant or are **disabled** simply do not appear on the card. No error is shown. If `show_disabled: true` is set, a greyed-out placeholder is rendered instead — useful during setup to confirm which entities are being detected.

### Slider behavior

Each slider maintains local state during a drag so the UI stays responsive. The value is committed to Home Assistant on `change` (mouse/touch release). The gradient fill and glow effect both track the slider's current position — at 0% both are invisible, brightening toward the right as the value increases.

## Related Projects

- [htd-home-assistant](https://github.com/theharshl/htd-home-assistant) — Home Assistant custom integration for HTD systems
- [python-htd](https://github.com/theharshl/python-htd) — Python library for the HTD protocol
