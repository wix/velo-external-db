const SchemaProvider = require('./spanner_schema_provider')
const DataProvider  = require('./spanner_data_provider')
const FilterParser = require('./sql_filter_transformer')
const DatabaseOperations = require('./spanner_operations')
const { Spanner } = require('@google-cloud/spanner')

const init = (cfg, _poolOptions) => {
    const spanner = new Spanner({projectId: cfg.projectId})
    const instance = spanner.instance(cfg.instanceId)

    const poolOptions = _poolOptions || { }

    const database = instance.database(cfg.databaseId, poolOptions)

    const databaseOperations = new DatabaseOperations(database)

    const filterParser = new FilterParser()
    const dataProvider = new DataProvider(database, filterParser)
    const schemaProvider = new SchemaProvider(database)

    return { dataProvider, schemaProvider, databaseOperations, connection: database, cleanup: async () => await database.close() }
}

module.exports = init