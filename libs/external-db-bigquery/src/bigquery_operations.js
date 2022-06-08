

const { DbConnectionError } = require('@wix-velo/velo-external-db-commons').errors

const notThrowingTranslateErrorCodes = err => {
    switch (err.code) {
        case 404:
            return new DbConnectionError(err.message)
        default :
            return new Error(`Default ${err.code} ${err.message}`)
    }
}

class DatabaseOperations {
    constructor(pool) {
        this.pool = pool
    }

    async validateConnection() {
        return await this.pool.getMetadata().then(() => ({ valid: true }))
                              .catch((e) => ({ valid: false, error: notThrowingTranslateErrorCodes(e) }))
    }
}

module.exports = DatabaseOperations