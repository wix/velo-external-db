const DatabaseOperations = require('../../src/airtable_operations')
const Airtable = require('airtable')

const createPool =  modify => {
    const config = {
        apiPrivateKey: 'key123',
        metaApiKey: 'meta123',
        baseId: 'app123',
        baseUrl: 'http://localhost:9000'
    }
    const _config = { ...config, ...modify }
    const airtableBase = new Airtable({ apiKey: _config.apiPrivateKey, endpointUrl: _config.baseUrl }).base(_config.baseId)
    return airtableBase
}

const dbOperationWithMisconfiguredApiPrivateKey = () => new DatabaseOperations(createPool({ apiPrivateKey: 'wrong' }))

const dbOperationWithMisconfiguredBaseId = () => new DatabaseOperations(createPool({ baseId: 'wrong' }))


const dbOperationWithValidDB = () => {
    const airtableBase = createPool({})
    const dbOperations = new DatabaseOperations(airtableBase)
    return { dbOperations, cleanup: () => { } }
}

const misconfiguredDbOperationOptions = () => ([   ['pool connection with wrong apiPrivateKey', () => dbOperationWithMisconfiguredApiPrivateKey()],
                                            ['pool connection with wrong baseId', () => dbOperationWithMisconfiguredBaseId()],
                                        ])

module.exports = {
    misconfiguredDbOperationOptions, dbOperationWithValidDB
}