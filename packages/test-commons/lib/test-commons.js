const { supportedSchemaOperationsFor } = require('velo-external-db-commons')

const Uninitialized = null

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const shouldNotRunOn = (impl, current) => !impl.includes(current)

const testIfOperationsSupportedFor = (impl) => {
    const supportedOperations = supportedSchemaOperationsFor(impl)
    return (neededOperations) => neededOperations.every(i => supportedOperations.includes(i)) ? test : test.skip
}

module.exports = { shouldNotRunOn, sleep, Uninitialized, testIfOperationsSupportedFor }