import { IDatabaseOperations } from '@wix-velo/velo-external-db-types'
import { promisify } from 'util'
import { notThrowingTranslateErrorCodes } from './sql_exception_translator'
import { Pool as MysqlPool } from 'mysql' 

export default class DatabaseOperations implements IDatabaseOperations {
    pool: MysqlPool 
    query: any
    constructor(pool: any) {
        this.pool = pool
        this.query = promisify(this.pool.query).bind(this.pool)
    }

    async validateConnection() {
        return await this.query('SELECT 1').then(() => { return { valid: true } })
                            .catch((e: any) => { return { valid: false, error: notThrowingTranslateErrorCodes(e, '') } })
    }
}
