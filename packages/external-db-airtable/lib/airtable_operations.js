
const { notThrowingTranslateErrorCodes } = require('./sql_exception_translator')
const { DbConnectionError } = require('velo-external-db-commons').errors

class DatabaseOperations {
    constructor(pool) {
        this.pool = pool;
    }

    async validateConnection() {
        try {
            await this.pool('Table').select({}).firstPage()
            return { valid: true }
        } catch (e) {
            if (e.error === 'NOT_FOUND')
                if (e.message !== 'Could not find what you are looking for') return { valid: true }
            return { valid: false, error: notThrowingTranslateErrorCodes(e) }
        }
    }
}

module.exports = DatabaseOperations

