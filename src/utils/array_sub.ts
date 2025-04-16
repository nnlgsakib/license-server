/**
 * Helper function to shuffle an array
 */
function shuffleArray<T>(array: T[]): T[] {
  return array
    .map((value) => ({value, sort: Math.random()}))
    .sort((a, b) => a.sort - b.sort)
    .map(({value}) => value)
}
export default shuffleArray
