const { GcpSpannerConfigReader } = require('../../lib/readers/gcp_config_reader')
const Chance = require('chance')
const chance = new Chance()

const defineValidConfig = (config) => {
    if (config.projectId) {
        process.env.PROJECT_ID = config.projectId
    }
    if (config.instanceId) {
        process.env.INSTANCE_ID = config.instanceId
    }
    if (config.databaseId) {
        process.env.DATABASE_ID = config.databaseId
    }
    if (config.secretKey) {
        process.env.SECRET_KEY = config.secretKey
    }
}

const validConfig = () => ({
    projectId: chance.word(),
    instanceId: chance.word(),
    databaseId: chance.word(),
    secretKey: chance.word(),
})

const ExpectedProperties = ['PROJECT_ID', 'INSTANCE_ID', 'DATABASE_ID', 'SECRET_KEY' ]

const reset = () => ExpectedProperties.forEach(p => delete process.env[p])

module.exports = {
    defineValidConfig,
    validConfig,
    reset,
    hasReadErrors: false,
    ExpectedProperties,
    configReaderProvider: new GcpSpannerConfigReader()
}

