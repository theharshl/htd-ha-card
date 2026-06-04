export function resolveEntities(mediaPlayerId) {
  const slug = mediaPlayerId.replace(/^media_player\./, '');
  return {
    mediaPlayer: mediaPlayerId,
    bass:    `number.${slug}_bass`,
    treble:  `number.${slug}_treble`,
    balance: `number.${slug}_balance`,
    dnd:     `switch.${slug}_dnd`,
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
