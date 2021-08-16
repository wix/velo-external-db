const { promisify } = require('util')
const { notThrowingTranslateErrorCodes } = require('./sql_exception_translator')

class DatabaseOperations {
    constructor(pool) {
        this.pool = pool;
        this.query = promisify(this.pool.query).bind(this.pool);
    }

    async validateConnection() {
        return await this.query('SELECT 1').then((res) => { return { valid: true } }).catch((e) => { return { valid: false, error: notThrowingTranslateErrorCodes(e) } })
    }
    config() {
        const config = Object.assign({}, this.pool.config.connectionConfig)
        if (config.password) config.password = '*********'
        return config
    }
}

module.exports = DatabaseOperations
