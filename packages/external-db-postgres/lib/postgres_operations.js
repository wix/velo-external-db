 const { notThrowingTranslateErrorCodes } = require('./sql_exception_translator')

class DatabaseOperations {
    constructor(pool) {
        this.pool = pool
    }

    async validateConnection() {
        return await this.pool.query('SELECT 1').then(() => { return { valid: true } })
                              .catch((e) => { return { valid: false, error: notThrowingTranslateErrorCodes(e) } })
    }
}

module.exports = DatabaseOperations