import crypto from 'crypto'

export function gen_license(): string {
  return 'nlg' + crypto.createHash('sha256').update(crypto.randomBytes(32)).digest('hex')
}

export function gen_user_key_hash(usr_key: string): string {
  return crypto.createHash('sha256').update(usr_key).digest('hex')
}

export function gen_bill_id() {
  return `nlg${crypto.createHash('sha256').update(Date.now().toString()).digest('hex').substring(0, 39)}`
}

export function gen_short_code(long_url: string): string {
  return 'nlg_' + crypto.createHash('sha256').update(long_url).digest('hex')
}

// Generate a unique SHA256 identifier for each task
export function generateTaskID(data: any): string {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')
}
