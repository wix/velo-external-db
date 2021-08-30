const { notThrowingTranslateErrorCodes } = require('./sql_exception_translator')

class DatabaseOperations {
    constructor(database) {
        this.database = database;
    }

    async validateConnection() {
        return await this.database.run({ sql: 'SELECT 1' })
                         .then(() => { return { valid: true } })
                         .catch((e) => { return { valid: false, error: notThrowingTranslateErrorCodes(e) } })
    }
}

module.exports = DatabaseOperations