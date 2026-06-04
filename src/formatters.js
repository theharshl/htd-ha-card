export function levelToVol(level) {
  return Math.round((level ?? 0) * 60);
}

export function volToLevel(vol) {
  return vol / 60;
}

export function formatVolume(vol) {
  return String(vol);
}

export function formatEq(val) {
  const v = parseInt(val);
  return v > 0 ? `+${v}` : String(v);
}

export function sliderPercent(value, min, max) {
  return ((value - min) / (max - min)) * 100;
}
