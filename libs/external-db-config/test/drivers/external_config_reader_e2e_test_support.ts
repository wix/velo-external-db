
import { Uninitialized } from '@wix-velo/test-commons'
import { create } from '../../src/factory'
import awsMySql = require('./aws_mysql_config_test_support')
import awsMongo = require('./aws_mongo_config_test_support')
import azureMySql = require('./azure_mysql_config_test_support')
import gcpMySql = require('./gcp_mysql_config_test_support')
import gcpSpanner = require('./gcp_spanner_config_test_support')
import gcpFirestore = require('./gcp_firestore_config_test_support')

export const env = {
    configReader: Uninitialized,
    driver: Uninitialized,
}

const initDriver = (vendor: string, engine: string) => {
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
        default:
            return gcpMySql
    }
}


export const initEnv = (vendor: string, engine: string) => {
    process.env['CLOUD_VENDOR'] = vendor
    process.env['TYPE'] = engine

    env.configReader = create()
    env.driver = initDriver(vendor, engine)
    env.driver.init?.()
}

const ExpectedProperties = ['CLOUD_VENDOR', 'TYPE']

export const reset = () => {
    env.driver.reset()
    ExpectedProperties.forEach(p => delete process.env[p])
}
