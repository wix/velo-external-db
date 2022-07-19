import SchemaProvider from './firestore_schema_provider'
import DataProvider from './firestore_data_provider'
import FilterParser from './sql_filter_transformer'
import DatabaseOperations from './firestore_operations'
import { Firestore } from '@google-cloud/firestore'
import { firestoreConfig } from './types'

export default ({ projectId }: firestoreConfig) => {
    const firestore = new Firestore({
        projectId: projectId,
    })

    const databaseOperations = new DatabaseOperations(firestore)
    const filterParser = new FilterParser()
    const dataProvider = new DataProvider(firestore, filterParser)
    const schemaProvider = new SchemaProvider(firestore)

    return { 
        dataProvider,
        schemaProvider,
        databaseOperations,
        connection: firestore, 
        cleanup: async() => await firestore.terminate() 
    }
}
