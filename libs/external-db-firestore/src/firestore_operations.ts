import { Firestore } from '@google-cloud/firestore'
import { IDatabaseOperations } from '@wix-velo/velo-external-db-types'
import { notThrowingTranslateErrorCodes } from './sql_exception_translator'

export default class DatabaseOperations implements IDatabaseOperations {
    database: Firestore

    public constructor(database: Firestore) {
        this.database = database
    }

    async validateConnection() {
        return await this.database.listCollections()
                         .then(() => { return { valid: true } })
                         .catch((e) => { return { valid: false, error: notThrowingTranslateErrorCodes(e) } })
    }

}
