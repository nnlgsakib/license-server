import { set, get, getAllLicenses } from '../storage/license_db'
import { LicenseData, LicenseValidationResult } from '../license'
import { generateUserKey } from '../utils/gen_user_key'
import { gen_license, gen_user_key_hash } from '../utils/gen_hash'
import {
  sendLicenseMail,
  sendLicenseExpiredMail,
  sendLicenseWarningMail,
  sendLicenseRenewalMail,
} from './mailService'
import { time_parser, getTimeRemaining, formatReadableDate, msToDays } from '../utils/time-decoder'
import logger from '../utils/logger'
import { config } from '../config/config'

// Default license duration if no months are specified by the user.
// '1mo' ~ 30 days. Adjust if exactness is needed.
const DEFAULT_LICENSE_DURATION = '1mo'

/**
 * Generate a new license for a user with a validity period derived from the given number of months.
 * If the user does not specify months, defaults to the `DEFAULT_LICENSE_DURATION`.
 *
 * @param userEmail The email of the user to associate with this license.
 * @param months Optional number of months for license validity. Minimum is 1 if provided.
 * @returns An object containing the generated license and userKey.
 */
export const generateLicense = async (
  userEmail: string,
  months?: number
): Promise<{ license: string; userKey: string }> => {
  const license = gen_license()
  const userKey = generateUserKey()

  const durationStr = months && months > 0 ? `${months}mo` : DEFAULT_LICENSE_DURATION
  const licenseDuration = time_parser(durationStr)

  const licenseData: LicenseData = {
    license: license,
    validUntil: Date.now() + licenseDuration,
    user_key_hash: gen_user_key_hash(userKey),
    isBlocked: false,
    userEmail,
  }

  await set(`license:${license}`, licenseData)

  sendLicenseMail(userEmail, license, userKey, formatReadableDate(licenseData.validUntil)).catch(
    (error) => logger.error('Failed to send license mail:', error)
  )

  return { license, userKey }
}

/**
 * Renew an existing license. If the user provides a number of months, it extends the license accordingly.
 * If the license is within the fixed warning days, it will be extended; otherwise it will not.
 *
 * @param license License ID.
 * @param userKey User key associated with this license.
 * @param months Optional number of months to extend the license. Defaults to `DEFAULT_LICENSE_DURATION` if not provided.
 * @returns A LicenseValidationResult with optional renewalWindowStartsAt.
 */
export const renewLicense = async (
  license: string,
  userKey: string,
  months?: number
): Promise<LicenseValidationResult & { renewalWindowStartsAt?: string }> => {
  try {
    const licenseData = await get<LicenseData>(`license:${license}`)
    if (!licenseData) {
      return { isValid: false, error: 'License not found' }
    }

    licenseData.validUntil = Number(licenseData.validUntil)

    const userKeyHash = gen_user_key_hash(userKey)
    if (licenseData.user_key_hash !== userKeyHash) {
      return { isValid: false, error: 'Invalid user key' }
    }

    const currentTime = Date.now()
    const timeUntilExpiration = licenseData.validUntil - currentTime
    const warningPeriod = config.warningDays * 24 * 60 * 60 * 1000 // Convert days to ms

    // If license is blocked
    if (licenseData.isBlocked) {
      if (timeUntilExpiration > 0) {
        return { isValid: false, error: 'License is blocked by admin and cannot be renewed.' }
      }
      // Blocked but expired, can still be renewed
      logger.info(`License ${license} is blocked due to expiration and can still be renewed.`)
    }

    // License not yet in warning period
    if (timeUntilExpiration > warningPeriod) {
      const renewalWindowStartsAt = new Date(
        licenseData.validUntil - warningPeriod
      ).toLocaleString()
      return {
        isValid: false,
        error: 'License cannot be renewed yet.',
        renewalWindowStartsAt,
      }
    }

    // License within warning period or slightly past expiration but still renewable
    if (timeUntilExpiration >= -warningPeriod) {
      const additionalDuration =
        months && months > 0 ? time_parser(`${months}mo`) : time_parser(DEFAULT_LICENSE_DURATION)

      licenseData.validUntil = Math.max(currentTime, licenseData.validUntil) + additionalDuration
      licenseData.isBlocked = false

      await set(`license:${license}`, licenseData)

      const renewedUntil = new Date(licenseData.validUntil).toLocaleString()
      await sendLicenseRenewalMail(licenseData.userEmail, license, renewedUntil)
      return { isValid: true }
    }

    // If it's too late to renew
    licenseData.isBlocked = true
    await set(`license:${license}`, licenseData)
    return { isValid: false, error: 'License cannot be renewed and is now permanently blocked.' }
  } catch (error) {
    logger.error('Error during license renewal:', error)
    return { isValid: false, error: 'Database error during renewal.' }
  }
}

/**
 * Block a license to prevent further use.
 * @param license The license to block.
 * @returns true if successful, false otherwise.
 */
export const blockLicense = async (license: string): Promise<boolean> => {
  try {
    const licenseData = await get<LicenseData>(`license:${license}`)
    if (!licenseData) return false

    licenseData.isBlocked = true
    await set(`license:${license}`, licenseData)
    return true
  } catch (error) {
    logger.error('Error blocking license:', error)
    return false
  }
}

/**
 * Unblock a previously blocked license.
 * @param license The license to unblock.
 * @returns true if successful, false otherwise.
 */
export const unblockLicense = async (license: string): Promise<boolean> => {
  try {
    const licenseData = await get<LicenseData>(`license:${license}`)
    if (!licenseData) return false

    licenseData.isBlocked = false
    await set(`license:${license}`, licenseData)
    return true
  } catch (error) {
    logger.error('Error unblocking license:', error)
    return false
  }
}

/**
 * Verify the validity of a license with the provided user key.
 * If invalid or expired, returns an error message. If valid, returns { isValid: true }.
 * @param license The license ID.
 * @param userKey The user key associated with the license.
 * @returns LicenseValidationResult indicating the license's validity.
 */
export const verifyLicense = async (
  license: string,
  userKey: string
): Promise<LicenseValidationResult> => {
  try {
    const licenseData = await get<LicenseData>(`license:${license}`)
    if (!licenseData) {
      return { isValid: false, error: 'License not found' }
    }

    licenseData.validUntil = Number(licenseData.validUntil)

    if (licenseData.isBlocked) {
      return { isValid: false, error: 'License is blocked' }
    }

    const userKeyHash = gen_user_key_hash(userKey)
    if (licenseData.user_key_hash !== userKeyHash) {
      return { isValid: false, error: 'Invalid user key' }
    }

    if (Date.now() >= licenseData.validUntil) {
      licenseData.isBlocked = true
      await set(`license:${license}`, licenseData)
      return { isValid: false, error: 'License has expired and is now blocked' }
    }

    return { isValid: true }
  } catch (error) {
    logger.error('Database error during verification:', error)
    return { isValid: false, error: 'Database error during verification.' }
  }
}

/**
 * Retrieve license details including end date and remaining time.
 * @param license The license ID.
 * @param userKey The user key associated with the license.
 * @returns An object with `endDate` and `remainingTime` if valid and unblocked, otherwise null.
 */
export const getLicenseDetails = async (
  license: string,
  userKey: string
): Promise<{ endDate: string; remainingTime: string } | null> => {
  try {
    const licenseData = await get<LicenseData>(`license:${license}`)
    if (!licenseData) return null

    licenseData.validUntil = Number(licenseData.validUntil)

    const userKeyHash = gen_user_key_hash(userKey)
    if (licenseData.user_key_hash !== userKeyHash || licenseData.isBlocked) {
      return null
    }

    const remainingTime = getTimeRemaining(licenseData.validUntil)
    return {
      endDate: new Date(licenseData.validUntil).toLocaleString(),
      remainingTime,
    }
  } catch (error) {
    logger.error('Error retrieving license details:', error)
    return null
  }
}

/**
 * Monitor all licenses stored in the database.
 * If a license is within the configured warning days, send a warning email.
 * If a license has expired, send an expiration email and block it.
 * This function is designed to be run periodically (e.g., via a cron job).
 */
export async function monitorLicenses(): Promise<void> {
  try {
    const licenses = await getAllLicenses<LicenseData>()
    const currentTime = Date.now()
    const warningPeriod = config.warningDays * 24 * 60 * 60 * 1000 // Convert days to ms

    for (const { key, value: licenseData } of licenses) {
      if (licenseData.isBlocked) continue

      const validUntil = Number(licenseData.validUntil)
      const timeRemaining = validUntil - currentTime
      const licenseId = key.replace('license:', '')
      const userEmail = licenseData.userEmail

      // Warn user if license is within the warning period
      if (timeRemaining <= warningPeriod && timeRemaining > 0) {
        const remainingDays = msToDays(timeRemaining)
        await sendLicenseWarningMail(userEmail, licenseId, remainingDays)
        logger.info(`Warning email sent for license ${licenseId} - ${remainingDays} days remaining`)
      }

      // Handle expiration
      if (timeRemaining <= 0) {
        await sendLicenseExpiredMail(userEmail, licenseId)
        logger.info(`Expiration email sent for license ${licenseId}`)

        // Block the license automatically
        licenseData.isBlocked = true
        await set(key, licenseData)
      }
    }
  } catch (error) {
    logger.error('Error in license monitoring:', error)
  }
}