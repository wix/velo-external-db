const aws = require('../aws')
const { randomCredentials, randomSecretKey } = require('../utils/password_utils')
const { blockUntil } = require('../utils/utils')
const { info, blankLine, startSpinnerWith } = require('../cli/display')

const providerFor = (vendor) => {
    switch (vendor) {
        case 'aws':
        case 'gcp':
        case 'azure':
            return aws
    }
}

const provisionDb = async (provider, engine, configWriter) => {
    const dbCredentials = randomCredentials()
    const number = Math.floor(Math.random() * 100)
    const instanceName = `velo-external-db-${number}`
    const secretKey = randomSecretKey()

    await startSpinnerWith(`Creating ${engine} DB Instance`, async () => await provider.createDb({ name: instanceName, engine: engine, credentials: dbCredentials}))
    await startSpinnerWith(`Waiting for db instance to start`, async () => await blockUntil( async () => !(await provider.dbStatusAvailable(instanceName)).available ))

    const status = await provider.dbStatusAvailable(instanceName)

    const dbName = 'velo_db'

    await startSpinnerWith(`Writing db config`, async () => await configWriter.writeConfig(dbCredentials, status.host, dbName, secretKey))

    await startSpinnerWith(`Provision Velo DB on db instance`, async () => await provider.postCreateDb(dbName, status.host, dbCredentials))
}

const provisionAdapter = async (provider, engine) => {
    const number = Math.floor(Math.random() * 100)
    const instanceName = `velo-external-db-adapter-${number}`

    const { serviceId } = await startSpinnerWith(`Provision Adapter`, async () => await provider.createAdapter(instanceName, engine))
    await startSpinnerWith(`Waiting adapter server instance to start`, async () => await blockUntil( async () => !(await provider.adapterStatus(serviceId)).available ))

    const status = await provider.adapterStatus(serviceId)

    blankLine()
    info(`Adapter available at ${status.serviceUrl}`)
}


const main = async ({ vendor, engine, credentials }) => {
    const provider = providerFor(vendor, credentials)

    const configWriter = new provider.ConfigWriter(credentials)
    const dbProvision = new provider.DbProvision(credentials)
    const adapterProvision = new provider.AdapterProvision(credentials)

    blankLine()
    blankLine()
    info('Provision DB Instance')
    await provisionDb(dbProvision, engine, configWriter)

    blankLine()
    blankLine()
    info('Provision Adapter')
    await provisionAdapter(adapterProvision, engine)

    blankLine()
    blankLine()
    blankLine()
}

module.exports = { main }