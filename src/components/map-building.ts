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
  color: string = '#000'; // 默認顏色

  static styles = css`
    :host {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    .building {
      position: absolute;
      border: 1px solid #000;
    }
  `;

  render() {
    return html`
      <div
        class="building"
        style="width: ${this.width * 32}px; height: ${this.height * 32}px; left: ${this.x * 32}px; top: ${this.y * 32}px; background-color: ${this.color};"
      ></div>
    `;
  }
} 