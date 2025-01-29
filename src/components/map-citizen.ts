import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('map-citizen')
export class MapCitizen extends LitElement {
  @property({ type: Number })
  x: number = 0;

  @property({ type: Number })
  y: number = 0;

  @property({ type: String })
  name: string = 'Citizen';

  @property({ type: String })
  color: string = 'blue';

  static styles = css`
    .citizen {
      width: 5px;
      height: 5px;
      border-radius: 50%; /* 圆形 */
      text-align: center;
      color: white;
      line-height: 5px; /* 垂直居中 */
      top: 0;
      left: 0;
      position: absolute;
    }
    .citizen:hover {
      border-color: red;
    }
  `;

  private handleClick() {
    this.dispatchEvent(new CustomEvent('citizen-click', {
      detail: { x: this.x, y: this.y, name: this.name },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div
        class="citizen"
        @click="${this.handleClick}"
        style="left: ${this.x * 32}px; top: ${this.y * 32}px;
        background-color: ${this.color};">
        ${this.name}
      </div>
    `;
  }
} 