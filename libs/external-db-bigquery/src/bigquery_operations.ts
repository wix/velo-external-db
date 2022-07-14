

import { Dataset } from '@google-cloud/bigquery'
import { errors } from '@wix-velo/velo-external-db-commons'
const { DbConnectionError } = errors

const notThrowingTranslateErrorCodes = (err: any) => {
    switch (err.code) {
        case 404:
            return new DbConnectionError(err.message)
        default :
            return new Error(`Default ${err.code} ${err.message}`)
    }
}

export default class DatabaseOperations {
    pool: Dataset
    constructor(pool: Dataset) {
        this.pool = pool
    }

    async validateConnection() {
        return await this.pool.getMetadata().then(() => ({ valid: true }))
                              .catch((e) => ({ valid: false, error: notThrowingTranslateErrorCodes(e) }))
    }
}

