import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { HistoryLogger, LogEntry } from '../../services/history-logger';

@customElement('action-history')
export class ActionHistory extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: #f5f5f5;
      border-radius: 4px;
      padding: 10px;
      margin: 10px 0;
      font-family: monospace;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      max-height: 300px;
      display: flex;
      flex-direction: column;
    }

    .history-top {
      flex-shrink: 0;
      border-bottom: 1px solid #ddd;
      padding-bottom: 10px;
      background: #f5f5f5;
    }

    .history-content {
      overflow-y: auto;
      flex-grow: 1;
      max-height: 240px;
    }

    .history-container {
      display: flex;
      flex-direction: column;
    }

    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }

    .history-title {
      font-weight: bold;
      font-size: 1.1em;
    }

    .history-controls {
      display: flex;
      gap: 5px;
    }

    .history-controls button {
      padding: 3px 8px;
      border-radius: 3px;
      border: 1px solid #ccc;
      background: white;
      cursor: pointer;
    }

    .history-controls button:hover {
      background: #e0e0e0;
    }

    .history-filters {
      display: flex;
      gap: 8px;
      margin: 10px 0;
      flex-wrap: wrap;
    }

    .filter-button {
      padding: 3px 8px;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      font-size: 0.8em;
    }

    .filter-button.all {
      background: #e0e0e0;
    }
    
    .filter-button.citizen {
      background: #90caf9;
    }
    
    .filter-button.company {
      background: #a5d6a7;
    }
    
    .filter-button.vehicle {
      background: #ffcc80;
    }
    
    .filter-button.system {
      background: #ef9a9a;
    }

    .filter-button.active {
      box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.2);
    }

    .log-entry {
      border-left: 3px solid #ddd;
      padding: 4px 8px;
      margin-bottom: 4px;
      font-size: 0.85em;
      line-height: 1.4;
      animation: fadeIn 0.3s;
    }

    .log-entry.citizen {
      border-left-color: #90caf9;
    }

    .log-entry.company {
      border-left-color: #a5d6a7;
    }

    .log-entry.vehicle {
      border-left-color: #ffcc80;
    }

    .log-entry.system {
      border-left-color: #ef9a9a;
    }

    .log-timestamp {
      color: #666;
      font-size: 0.8em;
      margin-right: 5px;
    }

    .log-source {
      font-weight: bold;
      margin-right: 5px;
      border-radius: 3px;
      padding: 1px 4px;
    }

    .log-source.citizen {
      background: #e3f2fd;
      color: #0d47a1;
    }

    .log-source.company {
      background: #e8f5e9;
      color: #1b5e20;
    }

    .log-source.vehicle {
      background: #fff3e0;
      color: #e65100;
    }

    .log-source.system {
      background: #ffebee;
      color: #b71c1c;
    }

    .log-action {
      font-style: italic;
      margin-right: 5px;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(5px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  @state()
  private logs: LogEntry[] = [];

  @state()
  private activeFilter: 'all' | 'citizen' | 'company' | 'vehicle' | 'system' = 'all';

  @state()
  private autoscroll: boolean = true;

  private unsubscribe: (() => void) | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.loadLogs();
    this.unsubscribe = HistoryLogger.getInstance().subscribe(() => {
      this.loadLogs();
    });
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    super.disconnectedCallback();
  }

  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    if (changedProperties.has('logs') && this.autoscroll) {
      this.scrollToBottom();
    }
  }

  private scrollToBottom() {
    const historyContent = this.shadowRoot?.querySelector('.history-content');
    if (historyContent) {
      historyContent.scrollTop = historyContent.scrollHeight;
    }
  }

  private loadLogs() {
    const historyLogger = HistoryLogger.getInstance();
    let logs = historyLogger.getLogs();
    
    if (this.activeFilter !== 'all') {
      logs = logs.filter(log => log.source === this.activeFilter);
    }
    
    // Limit to last 100 logs to prevent performance issues
    this.logs = logs.slice(0, 100);
  }

  private setFilter(filter: 'all' | 'citizen' | 'company' | 'vehicle' | 'system') {
    this.activeFilter = filter;
    this.loadLogs();
  }

  private toggleAutoscroll() {
    this.autoscroll = !this.autoscroll;
    if (this.autoscroll) {
      this.scrollToBottom();
    }
  }

  private clearLogs() {
    const historyLogger = HistoryLogger.getInstance();
    historyLogger.clearLogs();
    this.logs = [];
  }

  private formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  }

  render() {
    return html`
      <div class="history-top">
        <div class="history-header">
          <div class="history-title">Action History Log</div>
          <div class="history-controls">
            <button @click=${this.toggleAutoscroll}>
              ${this.autoscroll ? 'Auto-scroll: ON' : 'Auto-scroll: OFF'}
            </button>
            <button @click=${this.clearLogs}>Clear</button>
          </div>
        </div>
        <div class="history-filters">
          <button 
            class="filter-button all ${this.activeFilter === 'all' ? 'active' : ''}" 
            @click=${() => this.setFilter('all')}
          >
            All
          </button>
          <button 
            class="filter-button citizen ${this.activeFilter === 'citizen' ? 'active' : ''}" 
            @click=${() => this.setFilter('citizen')}
          >
            Citizens
          </button>
          <button 
            class="filter-button company ${this.activeFilter === 'company' ? 'active' : ''}" 
            @click=${() => this.setFilter('company')}
          >
            Companies
          </button>
          <button 
            class="filter-button vehicle ${this.activeFilter === 'vehicle' ? 'active' : ''}" 
            @click=${() => this.setFilter('vehicle')}
          >
            Vehicles
          </button>
          <button 
            class="filter-button system ${this.activeFilter === 'system' ? 'active' : ''}" 
            @click=${() => this.setFilter('system')}
          >
            System
          </button>
        </div>
      </div>
      <div class="history-content">
        <div class="history-container">
          ${this.logs.map((log) => html`
            <div class="log-entry ${log.source}">
              <span class="log-timestamp">${this.formatTimestamp(log.timestamp)}</span>
              <span class="log-source ${log.source}">${log.source}</span>
              <span class="log-action">${log.action}</span>
              <span>${log.details}</span>
            </div>
          `)}
          ${this.logs.length === 0 ? html`<div class="log-entry">No logs to display.</div>` : ''}
        </div>
      </div>
    `;
  }
}
