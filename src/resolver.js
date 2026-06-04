export function resolveEntities(mediaPlayerId, hass) {
  const match = mediaPlayerId.match(/zone_(\d+)/i);
  const n = match ? parseInt(match[1], 10) : 1;
  const suffix = n === 1 ? '' : `_${n}`;
  const pad = String(n).padStart(2, '0');

  let dnd = null;
  if (hass) {
    dnd = Object.keys(hass.states).find(id =>
      id.startsWith(`switch.${pad}_`) &&
      id.endsWith('_dnd') &&
      hass.entities?.[id]?.platform === 'htd'
    ) ?? null;
  }

  return {
    mediaPlayer: mediaPlayerId,
    bass:    `number.bass${suffix}`,
    treble:  `number.treble${suffix}`,
    balance: `number.balance${suffix}`,
    dnd,
  };
}

export function findHtdZones(hass) {
  return Object.keys(hass.states)
    .filter(id => id.startsWith('media_player.') && hass.entities?.[id]?.platform === 'htd')
    .map(id => ({
      value: id,
      label: hass.states[id].attributes.friendly_name || id,
    }));
}
