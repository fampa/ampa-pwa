export const formatDate = (date) => {
  const d = new Date(date)
  let month = `${d.getMonth() + 1}`
  let day = `${d.getDate()}`
  const year = d.getFullYear()
  if (month.length < 2) month = `0${month}`
  if (day.length < 2) day = `0${day}`
  return [day, month, year].join('/')
}

export const convertTZ = (date: Date, tzString?: string) => {
  tzString = tzString || 'Europe/Madrid'
  return new Date((typeof date === 'string' ? new Date(date) : date).toLocaleString('en-US', { timeZone: tzString }))
}
