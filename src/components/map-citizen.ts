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
  id: string = '';

  @property({ type: String })
  color: string = 'blue';

  @property({ type: Number })
  gridSize: number = 32;

  static styles = css`
    .citizen {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      text-align: center;
      color: white;
      font-size: 12px;
      line-height: 16px;
      top: 0;
      left: 0;
      position: absolute;
      z-index: 10;
      border: 1px solid #000;
      transform: translate(-8px, -8px);
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .citizen:hover {
      border: 2px solid yellow;
      transform: translate(-9px, -9px);
      z-index: 100;
    }
    .emoji {
      font-size: 14px;
    }
  `;

  private handleClick() {
    this.dispatchEvent(new CustomEvent('citizen-click', {
      detail: { x: this.x, y: this.y, name: this.name, id: this.id },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    // Use one of two predefined colors based on the first character of the name
    // This ensures the same citizen always has the same color
    let stableColor = '';
    if (this.color && this.color.startsWith('#')) {
      // If it's a hex color, use it directly
      stableColor = this.color;
    } else {
      // Fallback to male/female standard colors
      stableColor = this.name.charAt(0) < 'M' ? '#3498db' : '#e74c3c';
    }
    
    // Log for debugging
    console.log(`Rendering citizen ${this.name} at (${this.x}, ${this.y}) with color ${stableColor}`);
    
    return html`
      <div
        class="citizen"
        @click="${this.handleClick}"
        style="left: ${this.x * this.gridSize}px; top: ${this.y * this.gridSize}px;
        background-color: ${stableColor};"
        title="${this.name} at (${this.x.toFixed(2)}, ${this.y.toFixed(2)})"
        >
        <span class="emoji">👤</span>
      </div>
    `;
  }
} 