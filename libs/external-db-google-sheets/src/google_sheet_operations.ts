import { GoogleSpreadsheet } from 'google-spreadsheet'
import { IDatabaseOperations, ValidateConnectionResult } from '@wix-velo/velo-external-db-types'
import { notThrowingTranslateErrorCodes } from './google_sheet_exception_translator'

export default class DatabaseOperations implements IDatabaseOperations {
    doc: GoogleSpreadsheet

    constructor(doc: GoogleSpreadsheet) {
        this.doc = doc
    }

    async validateConnection(): Promise<ValidateConnectionResult> {
        try {
            await this.doc.loadInfo()
            return { valid: true }
        } catch (error) {
            return { valid: false, error: notThrowingTranslateErrorCodes(error) }
        } 
    }

}
