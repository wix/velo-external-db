
const { notThrowingTranslateErrorCodes } = require('./sql_exception_translator')
const { DbConnectionError } = require('velo-external-db-commons').errors

class DatabaseOperations {
    constructor(base) {
        this.base = base;
        this.baseId = base.getId()
    }

    async validateConnection() {
        try {
            await this.base('Table')
                      .select({})
                      .firstPage()
            return { valid: true }
        } catch (e) {
            if (e.message === `Could not find table Table in application ${this.baseId}`)  return { valid: true}
            return { valid: false, error: notThrowingTranslateErrorCodes(e) }
        }
    }
}

module.exports = DatabaseOperations

