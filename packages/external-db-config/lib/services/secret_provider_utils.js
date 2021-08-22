
const checkRequiredKeys = (obj, requiredKeys) => {
  const missingRequiredKeys = requiredKeys.reduce((missingKeys, key) => {
    if (!obj.hasOwnProperty(key) || obj[key] === undefined || obj[key] === '') {
      return [...missingKeys, key]
    } else {
      return missingKeys
    }
  }, [])

  return missingRequiredKeys
}

module.exports = { checkRequiredKeys }
