export function getData(key, generator) {
  let value = localStorage.getItem(key)
  if (!value) {
    value = generator(key)
    localStorage.setItem(key, value)
  }
  console.log(`${key}: ${value}`)
  return value
}
