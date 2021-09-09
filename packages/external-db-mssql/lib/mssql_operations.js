const { notThrowingTranslateErrorCodes } = require('./sql_exception_translator')

class DatabaseOperations {
    constructor(pool) {
        this.sql = pool
    }

    async validateConnection() {
        const sql = await this.sql
        if (sql._connected) {
            return await sql.query('SELECT 1')
                .then(() => { return { valid: true } })
                .catch((e) => { return { valid: false, error: notThrowingTranslateErrorCodes(e) } })
        }
        return await sql.connect()
            .then(() => { return { valid: true } })
            .catch((e) => { return { valid: false, error: notThrowingTranslateErrorCodes(e) } })

    }
}

module.exports = DatabaseOperations
