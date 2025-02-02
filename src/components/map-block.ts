import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('map-block')
export class MapBlock extends LitElement {
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

    .block {
      width: 32px;
      height: 32px;
      transition: background-color 0.3s ease;
    }

    .block:hover {
      filter: brightness(1.2);
      cursor: pointer;
    }
  `;

  private handleClick() {
    this.dispatchEvent(new CustomEvent('block-click', {
      detail: { x: this.x, y: this.y, type: this.type },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div 
        class="block block-${this.type}"
        @click=${this.handleClick}
        title="座標: ${this.x},${this.y}"
      ></div>
    `;
  }
} 