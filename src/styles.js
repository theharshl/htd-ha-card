import { css } from 'lit';

export const cardStyles = css`
  :host {
    display: block;
    --ha-card-background: #252525;
    --ha-card-border-color: #2e2e2e;
    --ha-card-border-radius: 12px;
    --ha-card-border-width: 1px;
  }

  .card-content {
    padding: 12px 16px;
  }

  /* ── Header ─────────────────────────────── */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .zone-name {
    font-size: 0.82rem;
    color: #e0e0e0;
    letter-spacing: 0.08em;
    font-weight: 500;
    transition: color 0.3s;
  }

  .header-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* ── Pill buttons (MUTE, DND) ────────────── */
  .pill {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    padding: 3px 8px;
    border-radius: 20px;
    border: 1px solid #333;
    background: transparent;
    color: #555;
    cursor: pointer;
    transition: box-shadow 0.2s, color 0.2s, border-color 0.2s;
    line-height: 1.4;
  }

  .mute-pill.active {
    color: #ffbb30;
    border-color: #ffbb30;
    box-shadow:
      0 0  6px #ffbb30cc,
      0 0 14px #ffbb3077,
      0 0 22px #ffbb3033;
  }

  .dnd-pill.active {
    color: #ff6030;
    border-color: #ff6030;
    box-shadow:
      0 0  6px #ff6030cc,
      0 0 14px #ff603077,
      0 0 22px #ff603033;
  }

  /* ── Power button ────────────────────────── */
  .power-btn {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 1px solid #333;
    background: transparent;
    color: #555;
    font-size: 0.88rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: box-shadow 0.2s, color 0.2s, border-color 0.2s;
    padding: 0;
    line-height: 1;
  }

  .power-btn.active {
    color: #4a8fff;
    border-color: #4a8fff;
    box-shadow:
      0 0  6px #4a8fffcc,
      0 0 14px #4a8fff77,
      0 0 22px #4a8fff33,
      inset 0 0  6px #4a8fff33;
  }

  /* ── Source selector ─────────────────────── */
  .source-row {
    margin-bottom: 10px;
  }

  .source-select {
    width: 100%;
    box-sizing: border-box;
    background: #2e2e2e;
    border: none;
    border-radius: 7px;
    color: #e0e0e0;
    padding: 7px 32px 7px 12px;
    font-size: 0.75rem;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23555' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    cursor: pointer;
    outline: none;
    transition: opacity 0.3s;
  }

  /* ── Sliders ─────────────────────────────── */
  .sliders {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .slider-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .slider-label {
    width: 32px;
    flex-shrink: 0;
    font-size: 0.63rem;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .slider-wrap {
    flex: 1;
    position: relative;
    height: 20px;
    display: flex;
    align-items: center;
  }

  .slider-track-bg {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 4px;
    transform: translateY(-50%);
    background: #2e2e2e;
    border-radius: 2px;
    pointer-events: none;
  }

  /* Glow layer: blurred gradient pinned to full track width */
  .slider-glow {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: linear-gradient(to right,
      transparent    0%,
      transparent   25%,
      #4a8fff22     45%,
      #4a8fff77     70%,
      #4a8fffbb    100%
    );
    background-size: var(--track-width, 100%) 100%;
    background-position: left center;
    background-repeat: no-repeat;
    filter: blur(4px);
    pointer-events: none;
    transition: opacity 0.3s;
  }

  /* Fill layer: crisp bar, width driven by JS inline style */
  .slider-fill {
    position: absolute;
    left: 0;
    top: 50%;
    height: 4px;
    transform: translateY(-50%);
    background: linear-gradient(to right,
      #4a8fff18  0%,
      #4a8fff44 28%,
      #4a8fff88 56%,
      #4a8fffbb 78%,
      #4a8fffee 100%
    );
    background-size: var(--track-width, 100%) 100%;
    background-position: left center;
    background-repeat: no-repeat;
    pointer-events: none;
    border-radius: 2px;
    min-width: 0;
  }

  /* Transparent native input sits on top for interaction */
  input[type="range"] {
    position: absolute;
    left: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
    cursor: pointer;
    z-index: 1;
  }

  .slider-value {
    width: 26px;
    flex-shrink: 0;
    font-size: 0.65rem;
    color: #7ab5ff;
    text-align: right;
    font-variant-numeric: tabular-nums;
    transition: color 0.3s;
  }

  /* ── Powered-off state ───────────────────── */
  .powered-off .zone-name       { color: #444; }
  .powered-off .slider-value    { color: #333; }
  .powered-off .slider-glow,
  .powered-off .slider-fill     { opacity: 0; }
  .powered-off input[type="range"]  { pointer-events: none; }
  .powered-off .source-select   { pointer-events: none; opacity: 0.3; }
  .powered-off .pill            { pointer-events: none; }
`;
