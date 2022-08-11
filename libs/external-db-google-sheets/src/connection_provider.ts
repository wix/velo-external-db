import { GoogleSpreadsheet } from 'google-spreadsheet'
import { loadSheets, docAuthSetup, promiseRetry } from './google_sheet_utils'
import SchemaProvider from './google_sheet_schema_provider'
import DataProvider from './google_sheet_data_provider'
import DatabaseOperations from './google_sheet_operations'
import { DbProviders } from '@wix-velo/velo-external-db-types'
import { GoogleSheetsConfig } from './types'

export default async(config: GoogleSheetsConfig): Promise<DbProviders<GoogleSpreadsheet>>  => {
    const doc = new GoogleSpreadsheet(config.sheetId)
    await promiseRetry(() => docAuthSetup(config, doc))
    await promiseRetry(() => loadSheets(doc))

    const databaseOperations = new DatabaseOperations(doc)
    const dataProvider = new DataProvider(doc)
    const schemaProvider = new SchemaProvider(doc)

    const cleanup = async() => { 
        await promiseRetry(() => Promise.allSettled(doc.sheetsByIndex.map(sheet => sheet.delete())))
        return
    }

    return { 
        dataProvider,
        schemaProvider,
        databaseOperations,
        connection: doc, 
        cleanup
    }
}

