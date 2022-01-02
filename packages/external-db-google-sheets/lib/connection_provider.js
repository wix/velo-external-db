const { GoogleSpreadsheet } = require('google-spreadsheet')
const { loadSheets } = require('./google_sheet_utils')
const SchemaProvider = require('./google_sheet_schema_provider')
const DataProvider = require('./google_sheet_data_provider')
const FilterParser = require('./sql_filter_transformer')
const DatabaseOperations = require('./google_sheet_operations')

const init = async(cfg) => {
    const doc = new GoogleSpreadsheet(cfg.sheetId)

    if (process.env.NODE_ENV === 'test') {
        doc.axios.defaults.baseURL = `http://localhost:1502/v4/spreadsheets/${cfg.sheetId}`
        doc.useRawAccessToken('mockup-token')
    } else {
        await doc.useServiceAccountAuth({
            client_email: cfg.clientEmail,
            private_key: cfg.apiPrivateKey
        })
    }

    await loadSheets(doc) 
    const databaseOperations = new DatabaseOperations(doc)
    const filterParser = new FilterParser()
    const dataProvider = new DataProvider(doc, filterParser)
    const schemaProvider = new SchemaProvider(doc)

    return { dataProvider, schemaProvider, databaseOperations, connection: doc, cleanup: async() => await Promise.all(doc.sheetsByIndex.map(sheet => sheet.delete())) }
}


module.exports = init
