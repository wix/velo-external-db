const { promisify } = require('util')
const translateErrorCodes = require('./sql_exception_translator')

class DatabaseOperations {
    constructor(pool) {
        this.pool = pool;
        this.query = promisify(this.pool.query).bind(this.pool);
    }

    async validateConnection() {
        let res
        try {
            await this.query('SELECT 1')
            res = { valid: true }
        } catch (e) {
            try {
                translateErrorCodes(e)
            }
            catch (error) {
                res = { valid: false, error }
            }
        }
        return res;
    }
    config() {
        const config = Object.assign({}, this.pool.config.connectionConfig)
        if (config.password) config.password = '*********'
        return config
    }
}

module.exports = DatabaseOperations
