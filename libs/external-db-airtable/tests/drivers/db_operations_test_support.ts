import DatabaseOperations from '../../src/airtable_operations'
import Airtable = require('airtable')

const createPool =  (modify: { apiPrivateKey?: string; baseId?: string }) => {
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


export const dbOperationWithValidDB = () => {
    const airtableBase = createPool({})
    const dbOperations = new DatabaseOperations(airtableBase)
    return { dbOperations, cleanup: () => { } }
}

export const misconfiguredDbOperationOptions = () => ([   ['pool connection with wrong apiPrivateKey', () => dbOperationWithMisconfiguredApiPrivateKey()],
                                            ['pool connection with wrong baseId', () => dbOperationWithMisconfiguredBaseId()],
                                        ])
