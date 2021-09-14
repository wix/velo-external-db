const { google } = require('googleapis')
const SchemaProvider = require('./google_sheet_schema_provider')
const DataProvider = require('./google_sheet_data_provider')

const init = async(cfg) => {
    const auth = new google.auth.GoogleAuth({
        keyFile: cfg.keyPath,
        scopes: 'https://www.googleapis.com/auth/spreadsheets',
    })
    const authClientObject = await auth.getClient()
    const googleSheetsInstance = google.sheets({ version: 'v4', auth: authClientObject})

    const dataProvider = new DataProvider(googleSheetsInstance, cfg.sheetId)
    const schemaProvider = new SchemaProvider(googleSheetsInstance, cfg.sheetId)

    return { dataProvider, schemaProvider /*, databaseOperations, connection: firestore, cleanup: async() => await firestore.terminate()*/ }
}


module.exports = init
