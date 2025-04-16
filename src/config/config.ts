// config/config.ts
import dotenv from 'dotenv'

dotenv.config()

// Helper to parse environment variables with defaults
const parseEnv = (key: string, defaultValue: any = '') => process.env[key] || defaultValue
const parseEnvInt = (key: string, defaultValue: number) =>
  parseInt(process.env[key] || `${defaultValue}`, 10)

// Interface for token configuration with address and decimals

// Export the config object
export const config = {
  port: parseEnvInt('PORT', 3000),
  private_key: parseEnv('ECC_PRIVATE_KEY'),
  masterkey: parseEnv('MASTER_KEY'),
  pay_page_url: parseEnv('WEB_PAGE'),
  mail_host: parseEnv('MAIL_HOST'),
  mail: parseEnv('MAIL'),
  mail_password: parseEnv('MAIL_PASSWORD'),
  mail_port: parseEnvInt('MAIL_PORT', 465  ),
  base_url: parseEnv('BASE_URL'),
}

// Export chain IDs as an array of strings