// const { promisify } = require('util')
// const { notThrowingTranslateErrorCodes } = require('./sql_exception_translator')

class DatabaseOperations {
    constructor(client) {
        this.client = client
//         this.query = promisify(this.pool.query).bind(this.pool);
    }

//     async validateConnection() {
//         return await this.query('SELECT 1').then(() => { return { valid: true } })
//                          .catch((e) => { return { valid: false, error: notThrowingTranslateErrorCodes(e) } })
//     }
}

module.exports = DatabaseOperations
