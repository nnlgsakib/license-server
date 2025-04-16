import crypto from 'crypto'

export const generateUserKey = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
  const bytes = crypto.randomBytes(6)
  return Array.from(bytes, (byte) => chars[byte % chars.length]).join('')
}
