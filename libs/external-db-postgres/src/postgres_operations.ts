import { Pool } from 'pg'
import { IDatabaseOperations } from '@wix-velo/velo-external-db-types'
import { notThrowingTranslateErrorCodes } from './sql_exception_translator'

export default class DatabaseOperations implements IDatabaseOperations {
    pool: Pool

    public constructor(pool: Pool) {
        this.pool = pool
    }

    // @ts-ignore
    async validateConnection() {
        return await this.pool.query('SELECT 1').then(() => { return { valid: true } })
                              .catch((e) => { return { valid: false, error: notThrowingTranslateErrorCodes(e, '') } })
    }
}
