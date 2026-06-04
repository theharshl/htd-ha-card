import { describe, it, expect } from 'vitest';
import { resolveEntities, findHtdZones } from '../src/resolver.js';

describe('resolveEntities', () => {
  it('derives all entity ids from a media_player entity id', () => {
    const result = resolveEntities('media_player.htd_lync_zone_1');
    expect(result).toEqual({
      mediaPlayer: 'media_player.htd_lync_zone_1',
      bass:    'number.htd_lync_zone_1_bass',
      treble:  'number.htd_lync_zone_1_treble',
      balance: 'number.htd_lync_zone_1_balance',
      dnd:     'switch.htd_lync_zone_1_dnd',
    });
  });

  it('works for zone 12 with a different device slug', () => {
    const result = resolveEntities('media_player.htd_lync_zone_12');
    expect(result.bass).toBe('number.htd_lync_zone_12_bass');
    expect(result.dnd).toBe('switch.htd_lync_zone_12_dnd');
  });

  it('returns mediaPlayer unchanged', () => {
    const id = 'media_player.htd_lync_zone_3';
    expect(resolveEntities(id).mediaPlayer).toBe(id);
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
