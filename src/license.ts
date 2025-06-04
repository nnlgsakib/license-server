export interface LicenseData {
  license:string
  validUntil: any
  user_key_hash: string // Store the user-specific key in hashed format
  isBlocked: boolean
  userEmail: string
  renewalWindow: any
}

export type LicenseValidationResult = {
  isValid: boolean
  error?: string
}
