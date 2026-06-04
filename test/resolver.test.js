import { describe, it, expect } from 'vitest';
import { resolveEntities, findHtdZones } from '../src/resolver.js';

describe('resolveEntities', () => {
  const makeHass = (dndEntities) => ({
    states: Object.fromEntries(dndEntities.map(id => [id, {}])),
    entities: Object.fromEntries(dndEntities.map(id => [id, { platform: 'htd' }])),
  });

  it('zone 1: EQ uses bare names, DND found by 01_ prefix', () => {
    const hass = makeHass(['switch.01_family_room_dnd']);
    const result = resolveEntities('media_player.lindon_home_lync_12_zone_01', hass);
    expect(result).toEqual({
      mediaPlayer: 'media_player.lindon_home_lync_12_zone_01',
      bass:    'number.bass',
      treble:  'number.treble',
      balance: 'number.balance',
      dnd:     'switch.01_family_room_dnd',
    });
  });

  it('zone 2: EQ uses _2 suffix', () => {
    const hass = makeHass(['switch.02_office_dnd']);
    const result = resolveEntities('media_player.lindon_home_lync_12_zone_02', hass);
    expect(result.bass).toBe('number.bass_2');
    expect(result.treble).toBe('number.treble_2');
    expect(result.balance).toBe('number.balance_2');
    expect(result.dnd).toBe('switch.02_office_dnd');
  });

  it('zone 10: handles two-digit zone in alternate entity id format', () => {
    const hass = makeHass(['switch.10_teagan_s_room_dnd']);
    const result = resolveEntities('media_player.zone_10_lindon_home_lync_12', hass);
    expect(result.bass).toBe('number.bass_10');
    expect(result.dnd).toBe('switch.10_teagan_s_room_dnd');
  });

  it('returns mediaPlayer unchanged', () => {
    const id = 'media_player.lindon_home_lync_12_zone_03';
    expect(resolveEntities(id, makeHass([])).mediaPlayer).toBe(id);
  });

  it('dnd is null when no matching switch exists', () => {
    const result = resolveEntities('media_player.lindon_home_lync_12_zone_01', makeHass([]));
    expect(result.dnd).toBeNull();
  });

  it('dnd is null when hass is not provided', () => {
    const result = resolveEntities('media_player.lindon_home_lync_12_zone_01');
    expect(result.dnd).toBeNull();
  });
});

describe('findHtdZones', () => {
  it('returns media_player entities registered to the htd platform', () => {
    const hass = {
      states: {
        'media_player.lindon_home_lync_12_zone_01': { attributes: { friendly_name: 'Living Room' } },
        'media_player.lindon_home_lync_12_zone_02': { attributes: { friendly_name: 'Bedroom' } },
        'media_player.sonos_living':                { attributes: { friendly_name: 'Sonos' } },
        'switch.lindon_home_lync_12_zone_01_dnd':   { state: 'off' },
      },
      entities: {
        'media_player.lindon_home_lync_12_zone_01': { platform: 'htd' },
        'media_player.lindon_home_lync_12_zone_02': { platform: 'htd' },
        'media_player.sonos_living':                { platform: 'sonos' },
      },
    };
    const zones = findHtdZones(hass);
    expect(zones).toHaveLength(2);
    expect(zones[0]).toEqual({ value: 'media_player.lindon_home_lync_12_zone_01', label: 'Living Room' });
    expect(zones[1]).toEqual({ value: 'media_player.lindon_home_lync_12_zone_02', label: 'Bedroom' });
  });

  it('falls back to entity id when friendly_name is absent', () => {
    const hass = {
      states: {
        'media_player.lindon_home_lync_12_zone_01': { attributes: {} },
      },
      entities: {
        'media_player.lindon_home_lync_12_zone_01': { platform: 'htd' },
      },
    };
    const zones = findHtdZones(hass);
    expect(zones[0].label).toBe('media_player.lindon_home_lync_12_zone_01');
  });

  it('returns empty array when no HTD zones exist', () => {
    expect(findHtdZones({ states: {}, entities: {} })).toEqual([]);
  });
});
