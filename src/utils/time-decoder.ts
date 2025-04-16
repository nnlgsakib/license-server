// Helper function to format remaining time
export function getTimeRemaining(expiresAt: number): string {
  const now = Date.now()
  const remainingMs = expiresAt - now

  if (remainingMs <= 0) {
    return 'Expired'
  }

  const remainingSeconds = Math.floor(remainingMs / 1000) // Convert to seconds

  if (remainingSeconds < 60) {
    // If remaining time is less than 1 minute, show seconds
    return `${remainingSeconds}s`
  }

  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  return `${minutes}m ${seconds}s` // Return in minutes and seconds
}

export function time_parser(timeString: string): number {
  const regex = /^(\d+)(s|m|h|d|w|mo|y)$/i // Changed to use 'mo' for months
  const match = timeString.trim().match(regex)

  if (!match) {
    throw new Error('Invalid time format. Use [number][unit], e.g., 1s, 2m, 1h, 3d, 1w, 1mo, 1y.')
  }

  const value = parseInt(match[1], 10)
  const unit = match[2].toLowerCase()

  let milliseconds

  switch (unit) {
    case 's': // Seconds
      milliseconds = value * 1000
      break
    case 'm': // Minutes
      milliseconds = value * 60 * 1000
      break
    case 'h': // Hours
      milliseconds = value * 60 * 60 * 1000
      break
    case 'd': // Days
      milliseconds = value * 24 * 60 * 60 * 1000
      break
    case 'w': // Weeks (7 days)
      milliseconds = value * 7 * 24 * 60 * 60 * 1000
      break
    case 'mo': // Months (30 days)
      milliseconds = value * 30 * 24 * 60 * 60 * 1000
      break
    case 'y': // Years (365 days)
      milliseconds = value * 365 * 24 * 60 * 60 * 1000
      break
    default:
      throw new Error('Invalid time unit')
  }

  return milliseconds
}

// Format the date into MM/DD/YYYY (HH:MM:SS AM/PM)
export const formatReadableDate = (timestamp: number): string => {
  const date = new Date(timestamp)
  const datePart = date.toLocaleDateString('en-US') // Format as MM/DD/YYYY
  const timePart = date.toLocaleTimeString('en-US') // Format as HH:MM:SS AM/PM
  return `${datePart} (${timePart})`
}
