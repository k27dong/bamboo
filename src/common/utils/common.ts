import { UserSelectEmojiPool } from "@/common/constants"

/**
 * Converts a duration string (HH:MM:SS, MM:SS, or SS) to total seconds
 * @param duration - The duration string to parse
 * @returns Total duration in seconds
 * @example
 * durationStringToSeconds('02:30')    // 150
 * durationStringToSeconds('01:02:30') // 3750
 */
export const durationStringToSeconds = (duration: string): number => {
  const parts = duration.split(":").map((part) => parseInt(part, 10))
  let seconds = 0
  if (parts.length === 3) {
    // HH:MM:SS
    seconds += parts[0] * 3600
    seconds += parts[1] * 60
    seconds += parts[2]
  } else if (parts.length === 2) {
    // MM:SS
    seconds += parts[0] * 60
    seconds += parts[1]
  } else if (parts.length === 1) {
    // SS
    seconds += parts[0]
  }
  return seconds
}

/**
 * Formats total seconds into a human-readable duration string
 * @param seconds - Total number of seconds
 * @returns Human-friendly duration string (e.g. "1h12m20s")
 * @example
 * secondsToHumanDuration(3661) // "1h1m1s"
 * secondsToHumanDuration(125)  // "2m5s"
 */
export const secondsToHumanDuration = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const parts = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  parts.push(`${seconds}s`)

  return parts.join("")
}

/**
 * Formats milliseconds to a colon-separated time string
 * @param ms - Milliseconds to format
 * @returns Time string in HH:MM:SS or MM:SS format
 * @throws {Error} If input is negative
 * @example
 * millisecondsToTimeString(90000)    // "01:30"
 * millisecondsToTimeString(3723000)  // "01:02:03"
 */
export const millisecondsToTimeString = (ms: number): string => {
  if (ms < 0) throw new Error("Milliseconds cannot be negative")

  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return hours > 0
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

/**
 * Converts a Unix timestamp (seconds or milliseconds) to a 4-digit year
 * @param timestamp - Unix timestamp (seconds or milliseconds since epoch)
 * @returns 4-digit year (e.g. 2024)
 * @throws {Error} If timestamp is invalid or out of range
 * @example
 * timestampToYear(1717987737)    // 2024 (seconds)
 * timestampToYear(1717987737000) // 2024 (milliseconds)
 */
export const timestampToYear = (timestamp: number): number => {
  if (typeof timestamp !== "number" || isNaN(timestamp)) {
    throw new Error("Invalid timestamp: must be a valid number")
  }

  // More accurate threshold for detecting second-based timestamps
  const adjustedTimestamp = timestamp < 1e10 ? timestamp * 1000 : timestamp
  const date = new Date(adjustedTimestamp)

  if (isNaN(date.getTime())) {
    throw new Error("Invalid timestamp: cannot convert to valid date")
  }

  return date.getFullYear()
}

/**
 * Get a deterministic emoji based on an integer input and a salt.
 * Ensures f(i, salt) and f(i+1, salt) behave the same way,
 * but f(i, salt1) and f(i, salt2) give different results.
 *
 * @param {number} i - The integer input (e.g., user ID, index)
 * @param {string | number} salt - A unique value to vary results (e.g., username, seed)
 * @returns {string} - A consistent emoji from the list
 */
export const getAvatarEmoji = (i: number, salt: string | number): string => {
  // Convert salt into a numeric hash
  const saltHash = [...String(salt)].reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0,
  )

  // Compute index using both i and saltHash to vary results
  const index = (i + saltHash) % UserSelectEmojiPool.length

  return UserSelectEmojiPool[index]
}
