exports.CONSOLE_STYLE_Reset = '\x1b[0m';
exports.CONSOLE_STYLE_FgBlack = '\x1b[30m';
exports.CONSOLE_STYLE_FgRed = '\x1b[31m';
exports.CONSOLE_STYLE_FgGreen = '\x1b[32m';
exports.CONSOLE_STYLE_FgYellow = '\x1b[33m';
exports.CONSOLE_STYLE_FgBlue = '\x1b[34m';
exports.CONSOLE_STYLE_FgMagenta = '\x1b[35m';
exports.CONSOLE_STYLE_FgCyan = '\x1b[36m';
exports.CONSOLE_STYLE_FgWhite = '\x1b[37m';
exports.CONSOLE_STYLE_FgGray = '\x1b[90m';
exports.CONSOLE_STYLE_FgOrange = '\x1b[38;5;208m';
exports.CONSOLE_STYLE_FgLightGreen = '\x1b[38;5;119m';
exports.CONSOLE_STYLE_FgLightBlue = '\x1b[38;5;117m';
exports.CONSOLE_STYLE_FgViolet = '\x1b[38;5;141m';
exports.CONSOLE_STYLE_FgBrown = '\x1b[38;5;130m';
exports.CONSOLE_STYLE_FgPink = '\x1b[38;5;219m';
exports.CONSOLE_STYLE_BgBlack = '\x1b[40m';
exports.CONSOLE_STYLE_BgRed = '\x1b[41m';
exports.CONSOLE_STYLE_BgGreen = '\x1b[42m';
exports.CONSOLE_STYLE_BgYellow = '\x1b[43m';
exports.CONSOLE_STYLE_BgBlue = '\x1b[44m';
exports.CONSOLE_STYLE_BgMagenta = '\x1b[45m';
exports.CONSOLE_STYLE_BgCyan = '\x1b[46m';
exports.CONSOLE_STYLE_BgWhite = '\x1b[47m';
exports.CONSOLE_STYLE_BgGray = '\x1b[100m';

const consoleLevelColors = {
  INFO: exports.CONSOLE_STYLE_FgCyan,
  WARN: exports.CONSOLE_STYLE_FgYellow,
  ERROR: exports.CONSOLE_STYLE_FgRed,
  DEBUG: exports.CONSOLE_STYLE_FgGray,
};

const consoleModuleColors = [
  exports.CONSOLE_STYLE_FgCyan,
  exports.CONSOLE_STYLE_FgGreen,
  exports.CONSOLE_STYLE_FgLightGreen,
  exports.CONSOLE_STYLE_FgBlue,
  exports.CONSOLE_STYLE_FgLightBlue,
  exports.CONSOLE_STYLE_FgMagenta,
  exports.CONSOLE_STYLE_FgOrange,
  exports.CONSOLE_STYLE_FgViolet,
  exports.CONSOLE_STYLE_FgBrown,
  exports.CONSOLE_STYLE_FgPink,
];

function intHash(str, length = 10) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash += str.charCodeAt(i);
  }
  return ((hash % length) + length) % length;
}
exports.intHash = intHash;

class Logger {
  constructor() {
    this.hideLog = {
      info: [],
      warn: [],
      error: [],
      debug: [],
    };
  }
  log(module, msg, level) {
    module = module.toUpperCase();
    level = level.toUpperCase();
    const levelColor = consoleLevelColors[level];
    const moduleColor =
      consoleModuleColors[intHash(module, consoleModuleColors.length)];
    let modulePart;
    let levelPart;
    let msgPart;
    modulePart = '[' + moduleColor + module + exports.CONSOLE_STYLE_Reset + ']';
    levelPart = levelColor + `${level}:` + exports.CONSOLE_STYLE_Reset;
    switch (level) {
      case 'ERROR':
        if (typeof msg === 'string') {
          msgPart =
            exports.CONSOLE_STYLE_FgRed + msg + exports.CONSOLE_STYLE_Reset;
        } else {
          msgPart = msg;
        }
        break;
      case 'DEBUG':
        if (typeof msg === 'string') {
          msgPart =
            exports.CONSOLE_STYLE_FgGray + msg + exports.CONSOLE_STYLE_Reset;
        } else {
          msgPart = msg;
        }
        break;
      default:
        msgPart = msg;
        break;
    }

    switch (level) {
      case 'ERROR':
        console.error(modulePart, levelPart, msgPart);
        break;
      case 'WARN':
        console.warn(modulePart, levelPart, msgPart);
        break;
      case 'INFO':
        console.info(modulePart, levelPart, msgPart);
        break;
      case 'DEBUG':
        console.debug(modulePart, levelPart, msgPart);
        break;
      default:
        console.log(modulePart, levelPart, msgPart);
        break;
    }
  }
  info(module, msg) {
    this.log(module, msg, 'info');
  }
  warn(module, msg) {
    this.log(module, msg, 'warn');
  }
  error(module, msg) {
    this.log(module, msg, 'error');
  }
  debug(module, msg) {
    this.log(module, msg, 'debug');
  }
  exception(module, exception, msg) {
    let finalMessage = exception;
    if (msg) {
      finalMessage = `${msg}: ${exception}`;
    }
    this.log(module, finalMessage, 'error');
  }
}
exports.log = new Logger();
