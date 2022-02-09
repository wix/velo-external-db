const objectContainsKey = (obj, key) => typeof obj[key] === 'string' && obj[key].length > 0

const checkRequiredKeys = (obj, requiredKeys) => requiredKeys.filter(key => !objectContainsKey(obj, key))

const supportedDBs = ['postgres', 'spanner', 'firestore', 'mssql', 'mysql', 'mongo', 'airtable', 'dynamodb', 'bigquery', 'google-sheets']

const supportedVendors = ['gcp', 'aws', 'azure']

const isJson = (str) => { try { JSON.parse(str); return true } catch (e) { return false } }

const EMPTY_ROLE_CONFIG = {
    collectionLevelRoleConfig: []
}

module.exports = { checkRequiredKeys, supportedDBs, supportedVendors, isJson, EMPTY_ROLE_CONFIG }