const aws = require('../aws')
const { randomCredentials, randomSecretKey } = require('../utils/password_utils')
const { waitFor } = require('poll-until-promise')

const providerFor = (vendor, credentials) => {
    switch (vendor) {
        case 'aws':
        case 'gcp':
        case 'azure':
            return aws
    }
}

const blockUntil = async f => {
    return waitFor(
        async () => {
            const response = await f()

            if (!response) {
                throw new Error('try again')
            }
        },
        {
            interval: 100,
            timeout: 10 * 60 * 1000,
            message: "Waiting for time to pass :)",
        }
    );
}

const provisionDb = async (provider, engine, configWriter) => {
    const dbCredentials = randomCredentials()
    const number = Math.floor(Math.random() * 100)
    const instanceName = `velo-external-db-${number}`
    const secretKey = randomSecretKey()

    await provider.createDb({ name: instanceName, engine: engine, credentials: dbCredentials})
    await blockUntil( async () => !(await provider.dbStatusAvailable(instanceName)).available )
    const status = await provider.dbStatusAvailable(instanceName)
        // create db

    await configWriter.writeConfig(dbCredentials, status.host, 'velo-db', secretKey)


    await provider.postCreateDb()
}

// const provisionServer = async (provider, credentials) => {
//     console.log('provision db')
//
//     await provider.createServer(credentials)
//     await provider.waitTillServerAvailable()
//     await provider.postCreateServer()
// }


const main = async ({ vendor, engine, credentials }) => {
    console.log(vendor, engine, credentials)

    const provider = providerFor(vendor, credentials)

    const configWriter = new provider.AwsConfigWriter(credentials)
    const dbProvision = new provider.AwsDbProvision(credentials)

    await provisionDb(dbProvision, engine, configWriter)
    // await provisionServer(provider, credentials)
}

module.exports = { main }