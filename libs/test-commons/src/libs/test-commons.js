const Uninitialized = null

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const shouldNotRunOn = (impl, current) => !impl.includes(current)

const shouldRunOnlyOn = (impl, current) => impl.includes(current)

const testIfSupportedOperationsIncludes = (supportedOperations, operation) => operation.every(o => supportedOperations.includes(o)) ? test : test.skip

module.exports = { shouldNotRunOn, shouldRunOnlyOn, sleep, Uninitialized, testIfSupportedOperationsIncludes }