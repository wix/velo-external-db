const { notThrowingTranslateErrorCodes } = require('./sql_exception_translator')

class DatabaseOperations {
    constructor(pool) {
        this.pool = pool;
    }

    async validateConnection() {
        return await this.pool.query('SELECT 1').then((res) => { return { valid: true } }).catch((e) => { return { valid: false, error: notThrowingTranslateErrorCodes(e) } })
    }
    config() {
        const config = Object.assign({}, this.pool.options)
        if (config.password) config.password = '*********'
        return config
    }
}

module.exports = DatabaseOperations