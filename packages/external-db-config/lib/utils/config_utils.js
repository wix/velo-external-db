const objectContainsKey = (obj, key) => typeof obj[key] === 'string' && obj[key].length > 0

const checkRequiredKeys = (obj, requiredKeys) => requiredKeys.filter(key => !objectContainsKey(obj, key) )

const supportedDBs = ['postgres', 'spanner', 'firestore', 'mssql', 'mysql', 'mongo', 'airtable', 'dynamodb', 'bigquery']

const supportedVendors = ['gcp', 'aws', 'azure']

module.exports = { checkRequiredKeys, supportedDBs, supportedVendors }
