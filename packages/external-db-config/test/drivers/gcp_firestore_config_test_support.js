const { GcpFirestoreConfigReader } = require('../../lib/readers/gcp_config_reader')
const Chance = require('chance')
const chance = new Chance()

const defineValidConfig = (config) => {
    if (config.projectId) {
        process.env.PROJECT_ID = config.projectId
    }
    if (config.secretKey) {
        process.env.SECRET_KEY = config.secretKey
    }
}

const validConfig = () => ({
    projectId: chance.word(),
    secretKey: chance.word(),
})

const ExpectedProperties = ['PROJECT_ID', 'SECRET_KEY' ]

const reset = () => ExpectedProperties.forEach(p => delete process.env[p])

module.exports = {
    defineValidConfig,
    validConfig,
    reset,
    hasReadErrors: false,
    ExpectedProperties,
    configReaderProvider: new GcpFirestoreConfigReader()
}

