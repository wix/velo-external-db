const objectContainsKey = (obj, key) => typeof obj[key] === 'string' && obj[key].length > 0

const checkRequiredKeys = (obj, requiredKeys) => requiredKeys.filter(key => !objectContainsKey(obj, key))

const supportedDBs = ['postgres', 'spanner', 'firestore', 'mssql', 'mysql', 'mongo', 'airtable', 'dynamodb', 'bigquery', 'google-sheets']

const supportedVendors = ['gcp', 'aws', 'azure']

const veloRoles = ['OWNER', 'BACKEND_CODE', 'VISITOR', 'MEMBER']

const collectionConfigPattern = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        readPolicies: { type: 'array', items: { enum: veloRoles } },
        writePolicies: { type: 'array', items: { enum: veloRoles } },
    },
    required: ['id']
}

const configPattern = {
    type: 'object',
    properties: {
        collectionLevelConfig: { items: collectionConfigPattern }
    },
    required: ['collectionLevelConfig']
}

const isJson = (str) => { try { JSON.parse(str); return true } catch (e) { return false } }

const EMPTY_ROLE_CONFIG = {
    collectionLevelConfig: []
}

module.exports = { checkRequiredKeys, supportedDBs, supportedVendors, isJson, EMPTY_ROLE_CONFIG, configPattern, collectionConfigPattern }