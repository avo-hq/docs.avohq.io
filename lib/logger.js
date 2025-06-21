import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Log levels with numeric priorities
 */
export const LOG_LEVELS = {
  SILENT: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4
};

/**
 * Color codes for console output
 */
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m'
};

/**
 * Logger class for handling application logging
 */
export class Logger {
  constructor(options = {}) {
    this.level = options.level || LOG_LEVELS.INFO;
    this.enableColors = options.enableColors !== false;
    this.logFile = options.logFile || null;
    this.includeTimestamp = options.includeTimestamp !== false;
    this.includeLevel = options.includeLevel !== false;
  }

  /**
   * Set the logging level
   * @param {number} level - Log level from LOG_LEVELS
   */
  setLevel(level) {
    this.level = level;
  }

  /**
   * Format a log message with timestamp and level
   * @param {string} level - Log level name
   * @param {string} message - Log message
   * @param {Object} extra - Additional data to log
   * @returns {string} Formatted log message
   */
  formatMessage(level, message, extra = {}) {
    let formatted = '';
    
    if (this.includeTimestamp) {
      const timestamp = new Date().toISOString();
      formatted += `[${timestamp}] `;
    }
    
    if (this.includeLevel) {
      formatted += `[${level.toUpperCase()}] `;
    }
    
    formatted += message;
    
    if (Object.keys(extra).length > 0) {
      formatted += ` ${JSON.stringify(extra)}`;
    }
    
    return formatted;
  }

  /**
   * Apply color to a message if colors are enabled
   * @param {string} message - Message to colorize
   * @param {string} color - Color code
   * @returns {string} Colored or plain message
   */
  colorize(message, color) {
    if (!this.enableColors) return message;
    return `${COLORS[color]}${message}${COLORS.reset}`;
  }

  /**
   * Write log to file if configured
   * @param {string} message - Formatted log message
   */
  writeToFile(message) {
    if (!this.logFile) return;
    
    try {
      // Ensure log directory exists
      const logDir = path.dirname(this.logFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      fs.appendFileSync(this.logFile, message + '\n');
    } catch (error) {
      // Fallback to console if file write fails
      console.error('Failed to write to log file:', error.message);
    }
  }

  /**
   * Log an error message
   * @param {string} message - Error message
   * @param {Object|Error} extra - Additional data or error object
   */
  error(message, extra = {}) {
    if (this.level < LOG_LEVELS.ERROR) return;
    
    if (extra instanceof Error) {
      extra = {
        name: extra.name,
        message: extra.message,
        stack: extra.stack
      };
    }
    
    const formatted = this.formatMessage('error', message, extra);
    const colored = this.colorize(formatted, 'red');
    
    console.error(colored);
    this.writeToFile(formatted);
  }

  /**
   * Log a warning message
   * @param {string} message - Warning message
   * @param {Object} extra - Additional data
   */
  warn(message, extra = {}) {
    if (this.level < LOG_LEVELS.WARN) return;
    
    const formatted = this.formatMessage('warn', message, extra);
    const colored = this.colorize(formatted, 'yellow');
    
    console.warn(colored);
    this.writeToFile(formatted);
  }

  /**
   * Log an info message
   * @param {string} message - Info message
   * @param {Object} extra - Additional data
   */
  info(message, extra = {}) {
    if (this.level < LOG_LEVELS.INFO) return;
    
    const formatted = this.formatMessage('info', message, extra);
    const colored = this.colorize(formatted, 'blue');
    
    console.log(colored);
    this.writeToFile(formatted);
  }

  /**
   * Log a debug message
   * @param {string} message - Debug message
   * @param {Object} extra - Additional data
   */
  debug(message, extra = {}) {
    if (this.level < LOG_LEVELS.DEBUG) return;
    
    const formatted = this.formatMessage('debug', message, extra);
    const colored = this.colorize(formatted, 'gray');
    
    console.log(colored);
    this.writeToFile(formatted);
  }

  /**
   * Log a success message
   * @param {string} message - Success message
   * @param {Object} extra - Additional data
   */
  success(message, extra = {}) {
    if (this.level < LOG_LEVELS.INFO) return;
    
    const formatted = this.formatMessage('success', message, extra);
    const colored = this.colorize(formatted, 'green');
    
    console.log(colored);
    this.writeToFile(formatted);
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger();

/**
 * Custom error classes for better error handling
 */
export class VitePressParserError extends Error {
  constructor(message, code = 'VITEPRESS_PARSER_ERROR', details = {}) {
    super(message);
    this.name = 'VitePressParserError';
    this.code = code;
    this.details = details;
  }
}

export class ConfigurationError extends Error {
  constructor(message, code = 'CONFIGURATION_ERROR', details = {}) {
    super(message);
    this.name = 'ConfigurationError';
    this.code = code;
    this.details = details;
  }
}

export class FileProcessingError extends Error {
  constructor(message, code = 'FILE_PROCESSING_ERROR', details = {}) {
    super(message);
    this.name = 'FileProcessingError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Error handler utility functions
 */
export const ErrorHandler = {
  /**
   * Handle and log errors with appropriate messaging
   * @param {Error} error - Error to handle
   * @param {Logger} loggerInstance - Logger instance to use
   * @param {Object} context - Additional context
   */
  handle(error, loggerInstance = logger, context = {}) {
    const errorInfo = {
      name: error.name,
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      details: error.details || {},
      context,
      stack: error.stack
    };

    loggerInstance.error(`Error occurred: ${error.message}`, errorInfo);
    
    // Return a sanitized error for user display
    return {
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      details: error.details || {}
    };
  },

  /**
   * Wrap async functions with error handling
   * @param {Function} fn - Async function to wrap
   * @param {Logger} loggerInstance - Logger instance
   * @returns {Function} Wrapped function
   */
  wrapAsync(fn, loggerInstance = logger) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        const handled = this.handle(error, loggerInstance, {
          function: fn.name,
          arguments: args.map(arg => typeof arg === 'object' ? '[Object]' : String(arg))
        });
        throw error; // Re-throw to allow caller to handle
      }
    };
  },

  /**
   * Create a validation error
   * @param {string} field - Field that failed validation
   * @param {string} value - Value that failed
   * @param {string} rule - Validation rule that failed
   * @returns {ConfigurationError} Validation error
   */
  validation(field, value, rule) {
    return new ConfigurationError(
      `Validation failed for field '${field}': ${rule}`,
      'VALIDATION_ERROR',
      { field, value, rule }
    );
  },

  /**
   * Create a file operation error
   * @param {string} operation - File operation (read, write, parse, etc.)
   * @param {string} filePath - Path to the file
   * @param {Error} originalError - Original error
   * @returns {FileProcessingError} File processing error
   */
  file(operation, filePath, originalError) {
    return new FileProcessingError(
      `Failed to ${operation} file '${filePath}': ${originalError.message}`,
      'FILE_OPERATION_ERROR',
      { operation, filePath, originalError: originalError.message }
    );
  }
};

/**
 * Performance timing utilities
 */
export class PerformanceTimer {
  constructor(loggerInstance = logger) {
    this.logger = loggerInstance;
    this.timers = new Map();
  }

  /**
   * Start a timer
   * @param {string} name - Timer name
   */
  start(name) {
    this.timers.set(name, {
      start: Date.now(),
      end: null
    });
    this.logger.debug(`Timer started: ${name}`);
  }

  /**
   * End a timer and log the duration
   * @param {string} name - Timer name
   * @returns {number} Duration in milliseconds
   */
  end(name) {
    const timer = this.timers.get(name);
    if (!timer) {
      this.logger.warn(`Timer '${name}' not found`);
      return 0;
    }

    timer.end = Date.now();
    const duration = timer.end - timer.start;
    
    this.logger.debug(`Timer completed: ${name}`, { duration: `${duration}ms` });
    this.timers.delete(name);
    
    return duration;
  }

  /**
   * Measure the execution time of a function
   * @param {string} name - Operation name
   * @param {Function} fn - Function to measure
   * @returns {Promise|any} Function result
   */
  async measure(name, fn) {
    this.start(name);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }
}