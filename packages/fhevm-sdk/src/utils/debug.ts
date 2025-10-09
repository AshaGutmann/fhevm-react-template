/**
 * Debug utilities for FHEVM SDK
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  data?: unknown;
}

class FHEVMDebugger {
  private enabled = false;
  private logLevel: LogLevel = 'info';
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  enable(level: LogLevel = 'debug') {
    this.enabled = true;
    this.logLevel = level;
    console.log('[FHEVM SDK] Debug mode enabled');
  }

  disable() {
    this.enabled = false;
    console.log('[FHEVM SDK] Debug mode disabled');
  }

  setLogLevel(level: LogLevel) {
    this.logLevel = level;
  }

  log(level: LogLevel, category: string, message: string, data?: unknown) {
    if (!this.enabled) return;

    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    if (levels.indexOf(level) < levels.indexOf(this.logLevel)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    const prefix = `[FHEVM SDK][${category}]`;
    const logFn = console[level] || console.log;

    if (data !== undefined) {
      logFn(prefix, message, data);
    } else {
      logFn(prefix, message);
    }
  }

  debug(category: string, message: string, data?: unknown) {
    this.log('debug', category, message, data);
  }

  info(category: string, message: string, data?: unknown) {
    this.log('info', category, message, data);
  }

  warn(category: string, message: string, data?: unknown) {
    this.log('warn', category, message, data);
  }

  error(category: string, message: string, data?: unknown) {
    this.log('error', category, message, data);
  }

  getLogs(category?: string): LogEntry[] {
    if (category) {
      return this.logs.filter(log => log.category === category);
    }
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Performance tracking
  private timers = new Map<string, number>();

  startTimer(name: string) {
    this.timers.set(name, performance.now());
    this.debug('Performance', `Timer started: ${name}`);
  }

  endTimer(name: string): number {
    const start = this.timers.get(name);
    if (!start) {
      this.warn('Performance', `Timer not found: ${name}`);
      return 0;
    }

    const duration = performance.now() - start;
    this.timers.delete(name);
    this.debug('Performance', `Timer ended: ${name}`, { duration: `${duration.toFixed(2)}ms` });
    return duration;
  }

  // Encryption/Decryption tracking
  trackEncryption(value: unknown, type: string, result: 'success' | 'error', duration?: number) {
    this.info('Encryption', `Encrypted ${type} value`, {
      value: typeof value,
      result,
      duration: duration ? `${duration.toFixed(2)}ms` : undefined,
    });
  }

  trackDecryption(ciphertext: unknown, result: 'success' | 'error', duration?: number) {
    this.info('Decryption', 'Decrypted value', {
      result,
      duration: duration ? `${duration.toFixed(2)}ms` : undefined,
    });
  }

  // Instance tracking
  trackInstanceCreation(chainId: number, success: boolean) {
    this.info('Initialization', `FHEVM instance creation`, {
      chainId,
      success,
    });
  }
}

// Singleton instance
export const debugger = new FHEVMDebugger();

// Convenience functions
export function enableDebug(level?: LogLevel) {
  debugger.enable(level);
}

export function disableDebug() {
  debugger.disable();
}

export function logDebug(category: string, message: string, data?: unknown) {
  debugger.debug(category, message, data);
}

export function logInfo(category: string, message: string, data?: unknown) {
  debugger.info(category, message, data);
}

export function logWarn(category: string, message: string, data?: unknown) {
  debugger.warn(category, message, data);
}

export function logError(category: string, message: string, data?: unknown) {
  debugger.error(category, message, data);
}
