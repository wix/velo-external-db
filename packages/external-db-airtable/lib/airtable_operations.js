
const { notThrowingTranslateErrorCodes } = require('./sql_exception_translator')

class DatabaseOperations {
    constructor(base) {
        this.base = base
        this.baseId = base.getId()
    }

    async validateConnection() {
        try {
            await this.base('Table')
                      .select({})
                      .firstPage()
            return { valid: true }
        } catch (e) {
            if (this.connectionSucceedTableDoesNotExist(e)) return { valid: true }
            return { valid: false, error: notThrowingTranslateErrorCodes(e) }
        }
    }

    connectionSucceedTableDoesNotExist(e) {
        return  e.message === `Could not find table Table in application ${this.baseId}`
    }
}

module.exports = DatabaseOperations

