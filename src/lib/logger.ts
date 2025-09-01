type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
  source?: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(level: LogLevel, message: string, data?: any, source?: string): string {
    const timestamp = new Date().toISOString();
    const sourcePrefix = source ? `[${source}] ` : '';
    const dataString = data ? ` | ${JSON.stringify(data)}` : '';
    
    return `${timestamp} ${level.toUpperCase()}: ${sourcePrefix}${message}${dataString}`;
  }

  debug(message: string, data?: any, source?: string) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, data, source));
    }
  }

  info(message: string, data?: any, source?: string) {
    console.info(this.formatMessage('info', message, data, source));
  }

  warn(message: string, data?: any, source?: string) {
    console.warn(this.formatMessage('warn', message, data, source));
  }

  error(message: string, error?: any, source?: string) {
    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error;
    
    console.error(this.formatMessage('error', message, errorData, source));
    
    // In production, you might want to send errors to a monitoring service
    // Example: Sentry, LogRocket, etc.
    if (!this.isDevelopment) {
      // Send to monitoring service
      this.sendToMonitoring('error', message, errorData, source);
    }
  }

  private sendToMonitoring(level: LogLevel, message: string, data?: any, source?: string) {
    // Implementation for sending logs to external monitoring service
    // This is a placeholder - implement based on your monitoring needs
    try {
      // Example: send to external service
      // fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     level,
      //     message,
      //     data,
      //     source,
      //     timestamp: new Date().toISOString(),
      //     userAgent: navigator.userAgent,
      //     url: window.location.href
      //   })
      // });
    } catch (error) {
      console.error('Failed to send log to monitoring service:', error);
    }
  }
}

export const logger = new Logger();

// Convenience functions
export const logError = (message: string, error?: any, source?: string) => {
  logger.error(message, error, source);
};

export const logWarn = (message: string, data?: any, source?: string) => {
  logger.warn(message, data, source);
};

export const logInfo = (message: string, data?: any, source?: string) => {
  logger.info(message, data, source);
};

export const logDebug = (message: string, data?: any, source?: string) => {
  logger.debug(message, data, source);
};