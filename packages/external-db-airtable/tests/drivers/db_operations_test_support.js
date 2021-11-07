const DatabaseOperations = require('../../lib/airtable_operations')
const init = require('../../lib/connection_provider')
const Airtable = require('airtable')

const createPool =  modify => {
    const config = {
        apiPrivateKey: 'key123',
        metaApiKey: 'meta123',
        baseId: 'app123',
        baseUrl: 'http://localhost:9000'
    }
    const _config = {...config, ...modify}
    const airtableBase = new Airtable({ apiKey: _config.apiPrivateKey, endpointUrl: _config.baseUrl }).base(_config.baseId)
    return airtableBase
}

const dbOperationWithMisconfiguredPassword = () => new DatabaseOperations(createPool({ apiPrivateKey: 'wrong' }))

const dbOperationWithMisconfiguredDatabase = () => new DatabaseOperations(createPool({ baseId: 'wrong' }))

const dbOperationWithMisconfiguredHost = () => new DatabaseOperations(createPool({ apiPrivateKey: 'wrong' }))

const dbOperationWithValidDB = () => {
    const airtableBase = createPool({})
    const dbOperations = new DatabaseOperations(airtableBase)
    return { dbOperations, cleanup: () => { } }
}

module.exports = {
    dbOperationWithMisconfiguredPassword, dbOperationWithMisconfiguredDatabase,
    dbOperationWithMisconfiguredHost, dbOperationWithValidDB
}