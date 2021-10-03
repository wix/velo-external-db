const aws = require('../aws')
const { randomCredentials, randomSecretKey } = require('../utils/password_utils')
const { blockUntil } = require('../utils/utils')

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

    await provider.createDb({ name: instanceName, engine: engine, credentials: dbCredentials})
    await blockUntil( async () => !(await provider.dbStatusAvailable(instanceName)).available )
    const status = await provider.dbStatusAvailable(instanceName)

    const dbName = 'velo_db'

    await configWriter.writeConfig(dbCredentials, status.host, dbName, secretKey)

    await provider.postCreateDb(dbName, status.host, dbCredentials)
}

const provisionAdapter = async (provider) => {
    await provider.createAdapter()
    await blockUntil( async () => !(await provider.adapterStatus()).available )
    const status = await provider.adapterStatus()

    console.log(status.serviceUrl)
}


const main = async ({ vendor, engine, credentials }) => {
    console.log(vendor, engine, credentials)

    const provider = providerFor(vendor, credentials)

    const configWriter = new provider.ConfigWriter(credentials)
    const dbProvision = new provider.DbProvision(credentials)
    const adapterProvision = new provider.AdapterProvision(credentials)

    await provisionDb(dbProvision, engine, configWriter)
    await provisionAdapter(adapterProvision)
}

module.exports = { main }