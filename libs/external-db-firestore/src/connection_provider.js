const SchemaProvider = require('./firestore_schema_provider')
const DataProvider  = require('./firestore_data_provider')
const FilterParser = require('./sql_filter_transformer')
const DatabaseOperations = require('./firestore_operations')
const Firestore = require('@google-cloud/firestore')

const init = ({ projectId }) => {
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