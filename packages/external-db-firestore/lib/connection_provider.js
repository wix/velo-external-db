const SchemaProvider = require('./firestore_schema_provider')
const DataProvider  = require('./firestore_data_provider')
const FilterParser = require('./sql_filter_transformer')
const DatabaseOperations = require('./firestore_operations')
const Firestore = require('@google-cloud/firestore')

const init = ([host,user,password,db], _poolOptions) => {
    // const projectId = user
    // const instanceId = host
    // const databaseId = db
    //
    // const spanner = new Spanner({projectId: projectId})
    // /*
    // todo: fix connection issues
    // password = private_key
    // client_email = ???
    //     client_email: serviceAccount.client_email,
    //     private_key: serviceAccount.private_key,
    //     projectId: serviceAccount.project_id,
    //  */
    // const instance = spanner.instance(instanceId)
    //
    // const poolOptions = _poolOptions || { }
    //
    // const database = instance.database(databaseId, poolOptions)
    //
    // const databaseOperations = new DatabaseOperations(database)
    //
    // const filterParser = new FilterParser()
    // const dataProvider = new DataProvider(database, filterParser)
    // const schemaProvider = new SchemaProvider(database)
    //
    // return { dataProvider, schemaProvider, databaseOperations, connection: database, cleanup: async () => await database.close() }
}

module.exports = init