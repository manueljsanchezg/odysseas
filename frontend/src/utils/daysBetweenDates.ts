export const getDaysBetweenDates = (startDate: string, endDate: string) => {
  const msPerDay = 24 * 60 * 60 * 1000
  const start = new Date(startDate)
  const end = new Date(endDate)
  const msDiff = end.getTime() - start.getTime()
  return Math.floor(msDiff / msPerDay)
}
