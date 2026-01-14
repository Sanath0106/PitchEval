// Console color utilities for better error visibility
// Works in both terminal and browser console

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  
  // Background colors
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
}

export const logger = {
  error: (...args: any[]) => {
    console.error(`${colors.red}❌${colors.reset}`, ...args)
  },
  
  success: (...args: any[]) => {
    console.log(`${colors.green}✅${colors.reset}`, ...args)
  },
  
  warning: (...args: any[]) => {
    console.warn(`${colors.yellow}⚠️${colors.reset}`, ...args)
  },
  
  info: (...args: any[]) => {
    console.log(`${colors.cyan}ℹ️${colors.reset}`, ...args)
  },
  
  processing: (...args: any[]) => {
    console.log(`${colors.blue}⚙️${colors.reset}`, ...args)
  },
  
  retry: (...args: any[]) => {
    console.log(`${colors.yellow}🔄${colors.reset}`, ...args)
  },
  
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${colors.gray}🔍${colors.reset}`, ...args)
    }
  }
}

export default logger
