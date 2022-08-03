import { IDatabaseOperations } from '@wix-velo/velo-external-db-types'
import { notThrowingTranslateErrorCodes } from './sql_exception_translator'

export default class DatabaseOperations implements IDatabaseOperations {
    database: any
    constructor(database: any) {
        this.database = database
    }

    async validateConnection() {
        return await this.database.run({ sql: 'SELECT 1' })
                         .then(() => { return { valid: true } })
                         .catch((e: any) => { return { valid: false, error: notThrowingTranslateErrorCodes(e) } })
    }
}
