// A service to log and track action history for citizens and companies
export interface LogEntry {
  id: string;
  timestamp: number;
  source: 'citizen' | 'company' | 'vehicle' | 'system';
  entityId: string;
  action: string;
  details?: string;
}

export class HistoryLogger {
  private static instance: HistoryLogger;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000; // Maximum number of logs to keep
  private subscribers: Set<() => void> = new Set();

  private constructor() {}

  static getInstance(): HistoryLogger {
    if (!HistoryLogger.instance) {
      HistoryLogger.instance = new HistoryLogger();
    }
    return HistoryLogger.instance;
  }

  // Add a new log entry
  addLog(source: 'citizen' | 'company' | 'vehicle' | 'system', entityId: string, action: string, details?: string): void {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      source,
      entityId,
      action,
      details
    };

    this.logs.unshift(entry); // Add to the beginning for newest first

    // Trim logs if exceeding maximum
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    this.notifySubscribers();
  }

  // Get all logs
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Get logs filtered by source
  getLogsBySource(source: 'citizen' | 'company' | 'vehicle' | 'system'): LogEntry[] {
    return this.logs.filter(log => log.source === source);
  }

  // Get logs for a specific entity
  getLogsByEntityId(entityId: string): LogEntry[] {
    return this.logs.filter(log => log.entityId === entityId);
  }

  // Clear all logs
  clearLogs(): void {
    this.logs = [];
    this.notifySubscribers();
  }

  // Subscribe to log changes
  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback());
  }
}
