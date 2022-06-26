import SchemaProvider = require('./firestore_schema_provider')
import DataProvider = require('./firestore_data_provider')
import FilterParser = require('./sql_filter_transformer')
import DatabaseOperations = require('./firestore_operations')
import { Firestore } from '@google-cloud/firestore'
import { firestoreConfig } from './types'

const init = ({ projectId }: firestoreConfig) => {
    const firestore = new Firestore({
        projectId: projectId,
    })

    const databaseOperations = new DatabaseOperations(firestore)

    const filterParser = new FilterParser()
    const dataProvider = new DataProvider(firestore, filterParser)
    const schemaProvider = new SchemaProvider(firestore)

    return { dataProvider, schemaProvider, databaseOperations, connection: firestore, cleanup: async() => await firestore.terminate() }
}

module.exports = init