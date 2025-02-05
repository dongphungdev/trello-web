/**
 * Capitalize the first letter of a string ( viết hoa chữ cái đầu tiên)
 */
export const capitalizeFirstLetter = (val) => {
  if (!val) return ''
  return `${val.charAt(0).toUpperCase()}${val.slice(1)}`
}
