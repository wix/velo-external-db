const { GoogleSpreadsheet } = require('google-spreadsheet');
const SchemaProvider = require('./google_sheet_schema_provider')
const DataProvider = require('./google_sheet_data_provider')
const DatabaseOperations = require('./google_sheet_operations')


const init = async(cfg) => {
    const doc = new GoogleSpreadsheet(cfg.sheetId)
    await doc.useServiceAccountAuth({
        client_email: cfg.clientEmail,
        private_key: cfg.apiPrivateKey
    })

    const databaseOperations = new DatabaseOperations(doc)
    const dataProvider = new DataProvider(doc)
    const schemaProvider = new SchemaProvider(doc)

    return { dataProvider, schemaProvider, databaseOperations /*, connection: firestore, cleanup: async() => await firestore.terminate()*/ }
}


module.exports = init
