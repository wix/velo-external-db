

import { Dataset } from '@google-cloud/bigquery'
import { errors } from '@wix-velo/velo-external-db-commons'
import { IDatabaseOperations, ValidateConnectionResult } from '@wix-velo/velo-external-db-types'
const { DbConnectionError, UnauthorizedError } = errors

const notThrowingTranslateErrorCodes = (err: any) => {
    switch (err.code) {
        case 404:
            return new DbConnectionError(err.message)
        default :
            return new UnauthorizedError(`${err.code} ${err.message}`)
    }
}

export default class DatabaseOperations implements IDatabaseOperations {
    pool: Dataset
    constructor(pool: Dataset) {
        this.pool = pool
    }

    async validateConnection(): Promise<ValidateConnectionResult>  {
        try {
            await this.pool.getMetadata()
            return { valid: true }
            
        } catch (error) {
            return { valid: false, error: notThrowingTranslateErrorCodes(error) }
        }
    }
}

