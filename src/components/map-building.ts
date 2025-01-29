import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('map-building')
export class MapBuilding extends LitElement {
  @property({ type: Number })
  x: number = 0;

  @property({ type: Number })
  y: number = 0;

  @property({ type: Number })
  width: number = 1;

  @property({ type: Number })
  height: number = 1;

  @property({ type: String })
  name: string = '';

  @property({ type: String })
  color: string = '#000'; // 默認顏色

  static styles = css`
    .building {
      position: absolute;
      border: 1px solid #000;
    }
    .building:hover {
      border-color: #0186d3;
    }
  `;

  private handleClick() {
    console.log(this);
    this.dispatchEvent(new CustomEvent('building-click', {
      detail: { x: this.x, y: this.y, name: this.name },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div
        class="building"
        @click="${this.handleClick}"
        style="width: ${this.width * 32}px; height: ${this.height * 32}px; left: ${this.x * 32}px; top: ${this.y * 32}px; background-color: ${this.color};"
      >
        ${this.name}
      </div>
    `;
  }
} 