import { DbConnector } from '@wix-velo/velo-external-db-commons'
import { ConfigValidator } from './firestore_config_validator'
export { default as SchemaProvider } from './firestore_schema_provider'
export { default as DataProvider } from './firestore_data_provider'
export { default as FilterParser } from './sql_filter_transformer'
export { default as DatabaseOperations } from './firestore_operations'
import init from './connection_provider'
export { default as init } from './connection_provider'
export * as testResources from '../tests/e2e-testkit/firestore_resources'

export const driver = () => require('../tests/drivers/sql_filter_transformer_test_support')
export const opsDriver = () => require('../tests/drivers/db_operations_test_support')

export class FirestoreConnector extends DbConnector {
    constructor() {
        super(ConfigValidator, init)
        this.type = 'firestore'
    }
}

export const firestoreFactory = async(config: any, options: any) => {
    const connector = new FirestoreConnector()
    const { connection, cleanup, ...providers } = await connector.initialize(config, options)
    return { connector, connection, providers, cleanup }
} 