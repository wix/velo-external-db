const { promisify } = require('util')
const translateErrorCodes = require('./sql_exception_translator')

class DatabaseOperations {
    constructor(pool) {
        this.pool = pool;
        this.query = promisify(this.pool.query).bind(this.pool);
    }

    async validateConnection() {
        return await this.query('SELECT 1').catch(translateErrorCodes);
    }
    config() {
        const config = Object.assign({},this.pool.config.connectionConfig)
        if (config.password) config.password = '*********'
        return config
    }
}

module.exports = DatabaseOperations