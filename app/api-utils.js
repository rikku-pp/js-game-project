const apiUrl = ''

const apiOptions = { cachePolicy: 'no-cache', retries: 1, retryOn: [502] }

const createQueryString = obj => {
  let query = ''
  for (let i = 0; i < Object.entries(obj).length; i++) {
    query += i === 0 ? '?' : '&'
    query += `${Object.keys(obj)[i]}=${Object.values(obj)[i]}`
  }
  return query
}

module.exports = {
  apiUrl,
  apiOptions,
  createQueryString
}
