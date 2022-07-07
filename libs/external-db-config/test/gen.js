const Chance = require('chance')
const { supportedVendors, supportedDBs } = require('../src/utils/config_utils')
const chance = Chance()

const randomConfig = () => ({
    host: chance.url(),
    user: chance.first(),
    password: chance.guid(),
    db: chance.word(),
})

const randomCommonConfig = () => ({
    secretKey: chance.guid(),
})

const randomExtendedCommonConfig = () => ({
    secretKey: chance.guid(),
    vendor: chance.pickone(supportedVendors),
    type: chance.pickone(supportedDBs),
})

module.exports = { randomConfig, randomCommonConfig, randomExtendedCommonConfig }