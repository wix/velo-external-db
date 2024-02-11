import { ILogger } from '@wix-velo/external-db-logger'
import { DatabaseFactoryResponse } from '@wix-velo/velo-external-db-commons'

export const engineConnectorFor = async(_type: string, config: any, logger?: ILogger): Promise<DatabaseFactoryResponse> => {
    const type = _type || ''
    switch ( type.toLowerCase() ) {
        case 'postgres': {
            const { postgresFactory } = require('@wix-velo/external-db-postgres')
            return await postgresFactory(config, logger)
        }
        case 'spanner': {
            const { spannerFactory } = require('@wix-velo/external-db-spanner')
            return await spannerFactory(config)
        }
        case 'firestore': {
            const { firestoreFactory } = require('@wix-velo/external-db-firestore')
            return await firestoreFactory(config)
        }
        case 'mssql': {
            const { mssqlFactory } = require('@wix-velo/external-db-mssql')
            return await mssqlFactory(config)
        }
        case 'mysql': {
            const { mySqlFactory } = require('@wix-velo/external-db-mysql')
            return await mySqlFactory(config, logger)
        }
        case 'mongo': {
            const { mongoFactory } = require('@wix-velo/external-db-mongo')
            return await mongoFactory(config)
        }
        // case 'google-sheet': {
        //     const { googleSheetFactory } = require('@wix-velo/external-db-google-sheets')
        //     return await googleSheetFactory(config)
        // }
        // case 'airtable': {
        //     const { airtableFactory } = require('@wix-velo/external-db-airtable')
        //     return await airtableFactory(config)
        // }
        case 'dynamodb': {
            const { dynamoDbFactory } = require('@wix-velo/external-db-dynamodb')
            return await dynamoDbFactory(config)
        }
        case 'bigquery': {
            const { bigqueryFactory } = require('@wix-velo/external-db-bigquery')
            return await bigqueryFactory(config)
        }
        default: {
            const { stubFactory } = require('./stub-db/stub-connector')
            return await stubFactory(type, config)
        }
    }
}
