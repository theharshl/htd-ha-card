import { LitElement, html } from 'lit';
import { cardStyles } from './styles.js';
import { formatVolume, formatEq, sliderPercent } from './formatters.js';
import { resolveEntities } from './resolver.js';
import './editor.js';

class HtdZoneCard extends LitElement {
  static get styles() { return cardStyles; }

  static get properties() {
    return {
      _hass:       { state: true },
      _config:     { state: true },
      _localVol:   { state: true },
      _localBass:  { state: true },
      _localTreble:{ state: true },
      _localBal:   { state: true },
    };
  }

  constructor() {
    super();
    this._localVol = null;
    this._localBass = null;
    this._localTreble = null;
    this._localBal = null;
  }

  setConfig(config) {
    if (!config.zone) throw new Error('htd-zone-card: "zone" is required in config');
    this._config = config;
    this._entities = resolveEntities(config.zone);
  }

  set hass(hass) {
    this._hass = hass;
  }

  static getConfigElement() {
    return document.createElement('htd-zone-card-editor');
  }

  static getStubConfig() {
    return { zone: '' };
  }

  connectedCallback() {
    super.connectedCallback();
    this._ro = new ResizeObserver(() => this._updateTrackWidths());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._ro?.disconnect();
  }

  firstUpdated() {
    this.renderRoot.querySelectorAll('.slider-wrap')
      .forEach(w => this._ro.observe(w));
    this._updateTrackWidths();
  }

  _updateTrackWidths() {
    this.renderRoot.querySelectorAll('.slider-wrap')
      .forEach(w => w.style.setProperty('--track-width', `${w.clientWidth}px`));
  }

  /* ── State getters ─────────────────────── */

  get _mp()         { return this._hass?.states[this._entities?.mediaPlayer]; }
  get _isPowered()  { return this._mp?.state === 'on'; }
  get _isMuted()    { return this._mp?.attributes.is_volume_muted ?? false; }
  get _volume()     {
    const level = this._mp?.attributes.volume_level ?? 0;
    return Math.round(level * 60);
  }
  get _source()     { return this._mp?.attributes.source ?? ''; }
  get _sourceList() { return this._mp?.attributes.source_list ?? []; }
  get _bass()       { return parseInt(this._hass?.states[this._entities?.bass]?.state ?? 0); }
  get _treble()     { return parseInt(this._hass?.states[this._entities?.treble]?.state ?? 0); }
  get _balance()    { return parseInt(this._hass?.states[this._entities?.balance]?.state ?? 0); }
  get _dnd()        { return this._hass?.states[this._entities?.dnd]?.state === 'on'; }

  _exists(entityId) {
    return Boolean(entityId && this._hass?.states[entityId]);
  }

  /* ── Render ────────────────────────────── */

  render() {
    if (!this._config) return html``;

    const powered = this._isPowered;
    const muted   = this._isMuted;
    const dnd     = this._dnd;
    const vol     = this._localVol   ?? this._volume;
    const bass    = this._localBass  ?? this._bass;
    const treble  = this._localTreble ?? this._treble;
    const bal     = this._localBal   ?? this._balance;

    const zoneName = (
      this._mp?.attributes.friendly_name ?? this._config.zone
    ).toUpperCase();

    const showDisabled = this._config.show_disabled ?? false;

    const hasMp      = this._exists(this._entities.mediaPlayer);
    const hasDnd     = this._exists(this._entities.dnd);
    const hasBass    = this._exists(this._entities.bass);
    const hasTreble  = this._exists(this._entities.treble);
    const hasBalance = this._exists(this._entities.balance);

    return html`
      <ha-card class=${powered ? '' : 'powered-off'}>
        <div class="card-content">

          <div class="header">
            <span class="zone-name">${zoneName}</span>
            <div class="header-controls">
              ${hasMp ? html`
                <button class="pill mute-pill ${muted ? 'active' : ''}"
                  @click=${this._toggleMute}>MUTE</button>
              ` : showDisabled ? html`<button class="pill mute-pill" disabled>MUTE</button>` : ''}

              ${hasDnd ? html`
                <button class="pill dnd-pill ${dnd ? 'active' : ''}"
                  @click=${this._toggleDnd}>DND</button>
              ` : showDisabled ? html`<button class="pill dnd-pill" disabled>DND</button>` : ''}

              <button class="power-btn ${powered ? 'active' : ''}"
                @click=${this._togglePower}>⏻</button>
            </div>
          </div>

          ${hasMp && this._sourceList.length ? html`
            <div class="source-row">
              <select class="source-select"
                ?disabled=${!powered}
                @change=${this._onSourceChange}>
                ${this._sourceList.map(s => html`
                  <option value=${s} ?selected=${s === this._source}>${s}</option>
                `)}
              </select>
            </div>
          ` : ''}

          <div class="sliders">
            ${hasMp
              ? this._renderSlider('VOL', vol, 0, 60,
                  e => { this._localVol = parseInt(e.target.value); },
                  this._onVolumeChange,
                  formatVolume)
              : showDisabled ? this._renderSliderDisabled('VOL') : ''}

            ${hasBass
              ? this._renderSlider('BASS', bass, -12, 12,
                  e => { this._localBass = parseInt(e.target.value); },
                  this._onBassChange,
                  formatEq)
              : showDisabled ? this._renderSliderDisabled('BASS') : ''}

            ${hasTreble
              ? this._renderSlider('TREB', treble, -12, 12,
                  e => { this._localTreble = parseInt(e.target.value); },
                  this._onTrebleChange,
                  formatEq)
              : showDisabled ? this._renderSliderDisabled('TREB') : ''}

            ${hasBalance
              ? this._renderSlider('BAL', bal, -12, 12,
                  e => { this._localBal = parseInt(e.target.value); },
                  this._onBalanceChange,
                  formatEq)
              : showDisabled ? this._renderSliderDisabled('BAL') : ''}
          </div>

        </div>
      </ha-card>
    `;
  }

  _renderSlider(label, value, min, max, onInput, onChange, formatter) {
    const pct = sliderPercent(value, min, max);
    return html`
      <div class="slider-row">
        <span class="slider-label">${label}</span>
        <div class="slider-wrap">
          <div class="slider-track-bg"></div>
          <div class="slider-glow"></div>
          <div class="slider-fill" style="width: ${pct}%"></div>
          <input type="range" min=${min} max=${max} .value=${String(value)}
            @input=${onInput} @change=${onChange}>
        </div>
        <span class="slider-value">${formatter(value)}</span>
      </div>
    `;
  }

  _renderSliderDisabled(label) {
    return html`
      <div class="slider-row" style="opacity: 0.25">
        <span class="slider-label">${label}</span>
        <div class="slider-wrap">
          <div class="slider-track-bg"></div>
        </div>
        <span class="slider-value">—</span>
      </div>
    `;
  }

  /* ── Actions ───────────────────────────── */

  _togglePower() {
    const svc = this._isPowered ? 'turn_off' : 'turn_on';
    this._hass.callService('media_player', svc, {
      entity_id: this._entities.mediaPlayer,
    });
  }

  _toggleMute() {
    this._hass.callService('media_player', 'mute_volume', {
      entity_id: this._entities.mediaPlayer,
      is_volume_muted: !this._isMuted,
    });
  }

  _toggleDnd() {
    const svc = this._dnd ? 'turn_off' : 'turn_on';
    this._hass.callService('switch', svc, {
      entity_id: this._entities.dnd,
    });
  }

  _onVolumeChange(e) {
    const vol = parseInt(e.target.value);
    this._hass.callService('media_player', 'volume_set', {
      entity_id: this._entities.mediaPlayer,
      volume_level: vol / 60,
    });
    this._localVol = null;
  }

  _onBassChange(e) {
    this._hass.callService('number', 'set_value', {
      entity_id: this._entities.bass,
      value: parseInt(e.target.value),
    });
    this._localBass = null;
  }

  _onTrebleChange(e) {
    this._hass.callService('number', 'set_value', {
      entity_id: this._entities.treble,
      value: parseInt(e.target.value),
    });
    this._localTreble = null;
  }

  _onBalanceChange(e) {
    this._hass.callService('number', 'set_value', {
      entity_id: this._entities.balance,
      value: parseInt(e.target.value),
    });
    this._localBal = null;
  }

  _onSourceChange(e) {
    this._hass.callService('media_player', 'select_source', {
      entity_id: this._entities.mediaPlayer,
      source: e.target.value,
    });
  }
}

customElements.define('htd-zone-card', HtdZoneCard);
