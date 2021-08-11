const translateErrorCodes = require('./sql_exception_translator')

class DatabaseOperations {
    constructor(pool) {
        this.pool = pool;
    }

    async validateConnection() {
        return await this.pool.query('SELECT 1').catch(translateErrorCodes);
    }
    config() {
        const config = Object.assign({}, this.pool.options)
        if (config.password) config.password = '*********'
        return config
    }
}

module.exports = DatabaseOperations