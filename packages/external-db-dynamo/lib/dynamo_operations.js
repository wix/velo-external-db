const { notThrowingTranslateErrorCodes } = require('./sql_exception_translator')

class DatabaseOperations {
    constructor(client) {
        this.client = client
    }

    async validateConnection() {
        return await this.client.listTables({}).then(() => { return { valid: true } })
                                               .catch((e) => { return { valid: false, error: notThrowingTranslateErrorCodes(e) } })
    }
}

module.exports = DatabaseOperations
