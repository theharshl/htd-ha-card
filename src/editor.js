import { LitElement, html, css } from 'lit';
import { findHtdZones } from './resolver.js';

class HtdZoneCardEditor extends LitElement {
  static get styles() {
    return css`
      .form { padding: 16px; }
      label { display: block; font-size: 0.85rem; margin-bottom: 4px; color: var(--primary-text-color); }
      select {
        width: 100%;
        padding: 8px;
        background: var(--card-background-color, #252525);
        color: var(--primary-text-color, #e0e0e0);
        border: 1px solid var(--divider-color, #2e2e2e);
        border-radius: 4px;
        font-size: 0.9rem;
      }
      .hint { font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 4px; }
    `;
  }

  static get properties() {
    return {
      hass:    {},
      _config: { state: true },
    };
  }

  setConfig(config) {
    this._config = config;
  }

  _zones() {
    if (!this.hass) return [];
    return findHtdZones(this.hass);
  }

  _onZoneChange(e) {
    const zone = e.target.value;
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { ...this._config, zone } },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    const zones = this._zones();
    const currentZone = this._config?.zone ?? '';

    return html`
      <div class="form">
        <label>Zone</label>
        <select @change=${this._onZoneChange}>
          <option value="" ?selected=${!currentZone}>-- Select a zone --</option>
          ${zones.map(z => html`
            <option value=${z.value} ?selected=${z.value === currentZone}>${z.label}</option>
          `)}
        </select>
        ${zones.length === 0 ? html`
          <p class="hint">No HTD zones found. Ensure the HTD integration is set up and has media_player entities.</p>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('htd-zone-card-editor', HtdZoneCardEditor);
