import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('map-tile')
export class MapTile extends LitElement {
  @property({ type: Number })
  type: number = 0;

  @property({ type: Number })
  x: number = 0;

  @property({ type: Number })
  y: number = 0;

  static styles = css`
    :host {
      display: block;
    }

    .tile {
      width: 32px;
      height: 32px;
      transition: background-color 0.3s ease;
    }

    .tile-0 { /* 草地 */
      background-color: #7ec850;
    }

    .tile-1 { /* 沙地 */
      background-color: #e6c587;
    }

    .tile-2 { /* 水域 */
      background-color: #6b8cce;
    }

    .tile-3 { /* 山地 */
      background-color: #8b7355;
    }

    .tile:hover {
      filter: brightness(1.2);
      cursor: pointer;
    }
  `;

  private handleClick() {
    this.dispatchEvent(new CustomEvent('tile-click', {
      detail: { x: this.x, y: this.y, type: this.type },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div 
        class="tile tile-${this.type}"
        @click=${this.handleClick}
        title="座標: ${this.x},${this.y}"
      ></div>
    `;
  }
} 