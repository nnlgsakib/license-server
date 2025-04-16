import path from 'path';
import fs from 'fs';
import zlib from 'zlib';

// **Log Levels Enum**
// Using an enum for clarity and to eliminate magic numbers
enum LogLevel {
  FATAL = 'fatal',
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace',
}

// **Universal Emojis**
const LOG_EMOJIS = {
  fatal: '🚨',
  error: '❌',
  warn: '⚠️',
  info: '🔍',
  debug: '🔬',
  trace: '🧭',
};

// **Color Palette**
// Remains unchanged but made configurable via options
class ColorPalette {
  static RESET = '\x1b[0m';

  static colors = {
    fatal: { text: '\x1b[1;37;41m', bg: '\x1b[48;5;196m\x1b[30m' },
    error: { text: '\x1b[1;31m', bg: '\x1b[48;5;160m\x1b[37m' },
    warn: { text: '\x1b[1;33m', bg: '\x1b[48;5;214m\x1b[30m' },
    info: { text: '\x1b[1;36m', bg: '\x1b[48;5;39m\x1b[37m' },
    debug: { text: '\x1b[1;35m', bg: '\x1b[48;5;93m\x1b[37m' },
    trace: { text: '\x1b[1;32m', bg: '\x1b[48;5;82m\x1b[37m' },
  };

  static getColor(level: LogLevel): string {
    return this.colors[level]?.text || '';
  }
}

// **Log Rotator**
// Handles log rotation and compression based on the number of files
class LogRotator {
  constructor(private logsDir: string, private maxLogFiles = 5) {
    fs.mkdirSync(logsDir, { recursive: true });
    this.rotateLogs();
  }

  public rotateLogs(): void {
    const files = fs
      .readdirSync(this.logsDir)
      .filter((file) => file.endsWith('.log'))
      .map((file) => ({
        name: file,
        path: path.join(this.logsDir, file),
        birthtime: fs.statSync(path.join(this.logsDir, file)).birthtime,
      }))
      .sort((a, b) => a.birthtime.getTime() - b.birthtime.getTime());

    while (files.length >= this.maxLogFiles) {
      const oldest = files.shift();
      if (oldest) {
        const compressedPath = `${oldest.path}.gz`;
        const fileContents = fs.readFileSync(oldest.path);
        fs.writeFileSync(compressedPath, zlib.gzipSync(fileContents));
        fs.unlinkSync(oldest.path);
      }
    }
  }

  getNewLogFilePath(): string {
    return path.join(this.logsDir, `app-${new Date().toISOString().replace(/:/g, '-')}.log`);
  }
}

// **Logger Options Interface**
interface LoggerOptions {
  logFile?: string;
  logLevel?: LogLevel;
  maxLogFiles?: number;
  logsDir?: string;
  maxLogSize?: number; // In bytes
  formatter?: LogFormatter;
  useColors?: boolean;
}

// **Log Formatter Type**
type LogFormatter = (level: LogLevel, message: string, ...args: any[]) => string;

// **Advanced Logger**
class AdvancedLogger {
  private writeStream: fs.WriteStream;
  private logLevelPriority: Record<LogLevel, number> = {
    [LogLevel.FATAL]: 1,
    [LogLevel.ERROR]: 2,
    [LogLevel.WARN]: 3,
    [LogLevel.INFO]: 4,
    [LogLevel.DEBUG]: 5,
    [LogLevel.TRACE]: 6,
  };
  private rotator: LogRotator;
  private logFile: string;
  private logLevel: LogLevel;
  private maxLogSize: number;
  private estimatedSize: number = 0;
  private formatter: LogFormatter;
  private useColors: boolean;

  constructor(options: LoggerOptions = {}) {
    const {
      logFile,
      logLevel = LogLevel.INFO,
      maxLogFiles = 5,
      logsDir = path.join(process.cwd(), 'logs'),
      maxLogSize = 10 * 1024 * 1024, // Default: 10MB
      formatter,
      useColors = true,
    } = options;

    this.rotator = new LogRotator(logsDir, maxLogFiles);
    this.logFile = logFile || this.rotator.getNewLogFilePath();
    this.logLevel = logLevel;
    this.maxLogSize = maxLogSize;
    this.formatter = formatter || this.defaultFormatter;
    this.useColors = useColors;

    // Initialize estimated size if log file exists
    if (fs.existsSync(this.logFile)) {
      const stats = fs.statSync(this.logFile);
      this.estimatedSize = stats.size;
    }

    this.writeStream = fs.createWriteStream(this.logFile, { flags: 'a' });
    this.writeStream.on('error', (err) => {
      console.error('Log file write error:', err);
    });
  }

  // **Default Formatter**
  private defaultFormatter(level: LogLevel, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const emoji = LOG_EMOJIS[level];
    let context = '';
    if (args.length) {
      context = args
        .map((arg) => {
          if (arg instanceof Error) {
            return arg.stack || arg.message;
          }
          return JSON.stringify(arg);
        })
        .join(' ');
    }
    return `${timestamp} [${level.toUpperCase()}] ${emoji} ${message} ${context}`;
  }

  // **Check if Log Should Be Processed**
  private shouldLog(level: LogLevel): boolean {
    return this.logLevelPriority[level] <= this.logLevelPriority[this.logLevel];
  }

  // **Core Log Method**
  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) return;

    const formattedLog = this.formatter(level, message, ...args);

    // Console output with optional colors
    if (this.useColors) {
      const color = ColorPalette.getColor(level);
      console.log(`${color}${formattedLog}${ColorPalette.RESET}`);
    } else {
      console.log(formattedLog);
    }

    // Asynchronous file writing with size-based rotation
    const logEntry = formattedLog + '\n';
    this.estimatedSize += Buffer.byteLength(logEntry, 'utf8');
    if (this.estimatedSize >= this.maxLogSize) {
      this.rotateLog();
    }
    if (!this.writeStream.write(logEntry)) {
      this.writeStream.once('drain', () => {
        // Handle backpressure if needed
      });
    }
  }

  // **Rotate Log File**
  private rotateLog(): void {
    this.writeStream.end();
    this.rotator.rotateLogs();
    this.logFile = this.rotator.getNewLogFilePath();
    this.writeStream = fs.createWriteStream(this.logFile, { flags: 'a' });
    this.writeStream.on('error', (err) => {
      console.error('Log file write error:', err);
    });
    this.estimatedSize = 0;
  }

  // **Public API (Compatible with Original)**
  fatal(message: string, ...args: any[]): void {
    this.log(LogLevel.FATAL, message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  trace(message: string, ...args: any[]): void {
    this.log(LogLevel.TRACE, message, ...args);
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }
}

// **Exports**
export { AdvancedLogger, LogLevel };
const defaultLogger = new AdvancedLogger();
export default defaultLogger;