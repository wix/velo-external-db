const CommonConfigReader = require('../../lib/readers/common_config_reader')
const Chance = require('chance')
const chance = new Chance()

const defineValidConfig = (config) => {
    if (config.vendor) {
        process.env.CLOUD_VENDOR = config.vendor
    }
    if (config.type) {
        process.env.TYPE = config.type
    }
    if (config.authVendor) {
        process.env.AUTH_VENDOR = config.authVendor
    }
}

const validConfig = () => ({
    vendor: chance.word(),
    type: chance.word(),
    authVendor: chance.word(),
})

const ExpectedProperties = ['CLOUD_VENDOR', 'TYPE', 'AUTH_VENDOR']

const reset = () => ExpectedProperties.forEach(p => delete process.env[p])

module.exports = {
    defineValidConfig,
    validConfig,
    reset,
    hasReadErrors: false,
    ExpectedProperties,
    configReaderProvider: new CommonConfigReader()
}

