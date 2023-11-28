import { GoogleSpreadsheet } from 'google-spreadsheet'
import { loadSheets, docAuthSetup } from './google_sheet_utils'
import SchemaProvider from './google_sheet_schema_provider'
import DataProvider from './google_sheet_data_provider'
import DatabaseOperations from './google_sheet_operations'
import { DbProviders } from '@wix-velo/velo-external-db-types'
import { GoogleSheetsConfig } from './types'

export default async(config: GoogleSheetsConfig): Promise<DbProviders<GoogleSpreadsheet>>  => {
    const doc = new GoogleSpreadsheet(config.sheetId)
    await docAuthSetup(config, doc)
    await loadSheets(doc)

    const databaseOperations = new DatabaseOperations(doc)
    const dataProvider = new DataProvider(doc, undefined, config.enableCache, config.stdTtl, config.checkPeriod)
    const schemaProvider = new SchemaProvider(doc)

    const cleanup = async() => { 
        await Promise.allSettled(doc.sheetsByIndex.map(sheet => sheet.delete()))
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

