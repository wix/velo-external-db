const objectContainsKey = (obj, key) => typeof obj[key] === 'string' && obj[key].length > 0

const checkRequiredKeys = (obj, requiredKeys) => requiredKeys.filter(key => !objectContainsKey(obj, key) )

module.exports = { checkRequiredKeys }
