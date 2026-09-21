export function formatDate(epochMs) {
  const date = new Date(Number(epochMs))
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}|${month}|${date.getFullYear()}`
}
