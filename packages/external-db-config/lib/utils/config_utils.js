
const objectDoesNotContainKey = (obj, key) => !obj.hasOwnProperty(key) || obj[key] === undefined || obj[key] === ''

const checkRequiredKeys = (obj, requiredKeys) => requiredKeys.filter(key => objectDoesNotContainKey(obj, key) )

module.exports = { checkRequiredKeys }
