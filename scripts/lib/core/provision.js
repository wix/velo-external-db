const aws = require('../aws')
const { randomCredentials, randomSecretKey } = require('../utils/password_utils')
const { blockUntil, randomWithPrefix } = require('../utils/utils')
const { info, blankLine, startSpinnerWith } = require('../cli/display')

const providerFor = (vendor) => {
    switch (vendor) {
        case 'aws':
        case 'gcp':
        case 'azure':
            return aws
    }
}

const provisionDb = async (provider, configWriter, { engine, secretId, secretKey, dbName }) => {
    const dbCredentials = randomCredentials()
    const instanceName = randomWithPrefix('velo-external-db')

    await startSpinnerWith(`Creating ${engine} DB Instance`, async () => await provider.createDb({ name: instanceName, engine: engine, credentials: dbCredentials}))
    await startSpinnerWith(`Waiting for db instance to start`, async () => await blockUntil( async () => !(await provider.dbStatusAvailable(instanceName)).available ))

    const status = await provider.dbStatusAvailable(instanceName)

    await startSpinnerWith(`Writing db config`, async () => await configWriter.writeConfig(secretId, dbCredentials, status.host, dbName, secretKey))

    await startSpinnerWith(`Provision Velo DB on db instance`, async () => await provider.postCreateDb(engine, dbName, status, dbCredentials))
}

const provisionAdapter = async (provider, engine, secretId) => {
    const instanceName = randomWithPrefix('velo-external-db-adapter')

    const { serviceId } = await startSpinnerWith(`Provision Adapter`, async () => await provider.createAdapter(instanceName, engine, secretId))
    await startSpinnerWith(`Waiting adapter server instance to start`, async () => await blockUntil( async () => (await provider.adapterStatus(serviceId)).available ))

    const status = await provider.adapterStatus(serviceId)

    blankLine()
    info(`Adapter available at ${status.serviceUrl}`)
}


const main = async ({ vendor, engine, credentials }) => {
    const region = 'us-east-2'
    const provider = providerFor(vendor, credentials)
    const configWriter = new provider.ConfigWriter(credentials, region)
    const dbProvision = new provider.DbProvision(credentials, region)
    const adapterProvision = new provider.AdapterProvision(credentials, region)

    const secretId = randomWithPrefix('VELO-EXTERNAL-DB-SECRETS')

    const secretKey = randomSecretKey()
    const dbName = 'velo_db'

    blankLine()
    blankLine()
    info('Provision DB Instance')
    await provisionDb(dbProvision, configWriter, { engine, secretId, secretKey, dbName})

    blankLine()
    blankLine()
    info('Provision Adapter')
    await provisionAdapter(adapterProvision, engine, secretId)

    blankLine()
    blankLine()
    blankLine()
}

module.exports = { main }