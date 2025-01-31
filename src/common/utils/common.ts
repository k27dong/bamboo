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
