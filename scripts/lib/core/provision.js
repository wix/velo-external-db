const aws = require('../aws')
const gcp = require('../gcp')
const azr = require ('../azure')
const { randomCredentials, randomSecretKey } = require('../utils/password_utils')
const { blockUntil, randomWithPrefix } = require('../utils/utils')
const { info, blankLine, startSpinnerWith } = require('../cli/display')

const providerFor = (vendor) => {
    switch (vendor) {
        case 'gcp':
            return gcp
        case 'aws':
            return aws
        case 'azure':
            return azr
    }
}

const provisionDb = async (provider, configWriter, { engine, secretId, secretKey, dbName, provisionVariables }) => {
    const dbCredentials = randomCredentials()
    const instanceName = randomWithPrefix('velo-external-db') 

    await startSpinnerWith(`Preparing ${engine} - running preCreate `, async () => await provider.preCreateDb(provisionVariables))
    
    await startSpinnerWith(`Creating ${engine} DB Instance`, async () => await provider.createDb({ name: instanceName, engine: engine, credentials: dbCredentials, ...provisionVariables}))
    await startSpinnerWith(`Waiting for db instance to start`, async () => await blockUntil( async () => (await provider.dbStatusAvailable(instanceName)).available ))

    const status = await provider.dbStatusAvailable(instanceName, provisionVariables)

    const secrets = await startSpinnerWith(`Writing db config`, async () => await configWriter.writeConfig(secretId, dbCredentials, status.host, status.connectionName, dbName, secretKey, provisionVariables, instanceName))

    await startSpinnerWith(`Provision Velo DB on db instance`, async () => await provider.postCreateDb(engine, dbName, status, dbCredentials, provisionVariables, instanceName))

    return { status, secrets }
}

const provisionAdapter = async (provider, engine, secretId, secrets) => {
    const instanceName = randomWithPrefix('velo-external-db-adapter')

    const { serviceId } = await startSpinnerWith(`Provision Adapter`, async () => await provider.createAdapter(instanceName, engine, secretId, secrets, provisionVariables))
    await startSpinnerWith(`Waiting adapter server instance to start`, async () => await blockUntil( async () => (await provider.adapterStatus(serviceId, provisionVariables)).available ))

    const status = await provider.adapterStatus(serviceId, provisionVariables)

    await startSpinnerWith(`Giving adapter access to config`, async () => await configWriter.updateAccessPolicy(status, provisionVariables))

    await startSpinnerWith(`Post create instance`, async () => provider.postCreateAdapter(instanceName, provisionVariables))

    blankLine()
    info(`Adapter available at ${status.serviceUrl}`)
}


const main = async ({ vendor, engine, credentials }) => {
    const region = 'us-east-2'
    const provider = providerFor(vendor, credentials)
    const configWriter = new provider.ConfigWriter(credentials, region)
    const dbProvision = new provider.DbProvision(credentials, region, engine)
    const adapterProvision = new provider.AdapterProvision(credentials, region)
    
    const secretId = randomWithPrefix('VELO-EXTERNAL-DB-SECRETS')
    const secretKey = randomSecretKey()
    const dbName = 'velo_db'

    const provisionVariables = provider.provisionVariables // todo : refactor 

    blankLine()
    blankLine()
    info('Provision DB Instance')
    const {status, secrets} = await provisionDb(dbProvision, configWriter, { engine, secretId, secretKey, dbName, provisionVariables})

    blankLine()
    blankLine()
    info('Provision Adapter')
    await provisionAdapter(adapterProvision, engine, secretId, secrets, status.connectionName, configWriter, provisionVariables)

    blankLine()
    blankLine()
    blankLine()
}

module.exports = { main }