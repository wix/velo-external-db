import { IDatabaseOperations } from '@wix-velo/velo-external-db-types'
import { notThrowingTranslateErrorCodes } from './sql_exception_translator'

export default class DatabaseOperations implements IDatabaseOperations{
    sql: any
    constructor(pool: any) {
        this.sql = pool
    }

    async validateConnection() {
        const sql = await this.sql
        if (sql._connected) {
            return await sql.query('SELECT 1')
                .then(() => { return { valid: true } })
                .catch((e: any) => { return { valid: false, error: notThrowingTranslateErrorCodes(e) } })
        }
        return await sql.connect()
            .then(() => { return { valid: true } })
            .catch((e: any) => { return { valid: false, error: notThrowingTranslateErrorCodes(e) } })

    }
}
