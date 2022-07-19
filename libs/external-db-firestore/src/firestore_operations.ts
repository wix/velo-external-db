import { Firestore } from '@google-cloud/firestore'
import { IDatabaseOperations, ValidateConnectionResult } from '@wix-velo/velo-external-db-types'
import { notThrowingTranslateErrorCodes } from './sql_exception_translator'

export default class DatabaseOperations implements IDatabaseOperations {
    database: Firestore

    public constructor(database: Firestore) {
        this.database = database
    }

    async validateConnection(): Promise<ValidateConnectionResult> {
        try {
            await this.database.listCollections()
            return { valid: true }
        } catch (error) {
            return { valid: false, error: notThrowingTranslateErrorCodes(error) }
        }
    }

}
