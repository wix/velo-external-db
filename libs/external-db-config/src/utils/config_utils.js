const objectContainsKey = (obj, key) => typeof obj[key] === 'string' && obj[key].length > 0

const checkRequiredKeys = (obj, requiredKeys) => requiredKeys.filter(key => !objectContainsKey(obj, key))

const supportedDBs = ['postgres', 'spanner', 'firestore', 'mssql', 'mysql', 'mongo', 'airtable', 'dynamodb', 'bigquery', 'google-sheets']

const supportedVendors = ['gcp', 'aws', 'azure']

const veloRoles = ['Admin', 'Member', 'Visitor']

const collectionConfigPattern = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        read: { type: 'array', items: { enum: veloRoles } },
        write: { type: 'array', items: { enum: veloRoles } },
    },
    additionalProperties: false,
    required: ['id']
}

const configPattern = {
    type: 'object',
    properties: {
        collectionPermissions: { type: 'array', items: collectionConfigPattern }
    },
    required: ['collectionPermissions']
}

const isJson = (str) => { try { JSON.parse(str); return true } catch (e) { return false } }

const jsonParser = (str) => {
    let parsed = JSON.parse(str)
    if (typeof parsed === 'string') parsed = jsonParser(parsed)
    return parsed
 }

const EmptyRoleConfig = {
    collectionPermissions: []
}

module.exports = { checkRequiredKeys, supportedDBs, supportedVendors, isJson, jsonParser, EmptyRoleConfig, configPattern, collectionConfigPattern }