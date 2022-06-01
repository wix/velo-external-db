const { Uninitialized } = require('@wix-velo/test-commons')
const { create } = require('../../lib/factory')
const awsMySql = require('./aws_mysql_config_test_support')
const awsMongo = require('./aws_mongo_config_test_support')
const azureMySql = require('./azure_mysql_config_test_support')
const gcpMySql = require('./gcp_mysql_config_test_support')
const gcpSpanner = require('./gcp_spanner_config_test_support')
const gcpFirestore = require('./gcp_firestore_config_test_support')

const env = {
    configReader: Uninitialized,
}

const initDriver = (vendor, engine) => {
    switch (vendor.toLowerCase()) {
        case 'aws':
            switch(engine) {
                case 'mysql':
                case 'postgres':
                    return awsMySql
                case 'mongo':
                    return awsMongo
            }
            return awsMySql
        case 'azure':
            return azureMySql
        case 'gcp':
            switch (engine) {
                case 'spanner':
                    return gcpSpanner
                case 'firestore':
                    return gcpFirestore
                default:
                    return gcpMySql
            }
    }
}


const initEnv = (vendor, engine) => {
    process.env.CLOUD_VENDOR = vendor
    process.env.TYPE = engine

    env.configReader = create()
    env.driver = initDriver(vendor, engine)
    env.driver.init?.()
}

const ExpectedProperties = ['CLOUD_VENDOR', 'TYPE']

const reset = () => {
    env.driver.reset()
    ExpectedProperties.forEach(p => delete process.env[p])
}

module.exports = { initEnv, reset, env,
}