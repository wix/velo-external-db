const translateErrorCodes = require('./sql_exception_translator')

class DatabaseOperations {
    constructor(pool) {
        this.pool = pool;
    }

    async checkIfConnectionSucceeded() {
        return await this.pool.query('SELECT 1').catch(translateErrorCodes);
    }
    getPoolConfig() {
        const config = Object.assign({}, this.pool.options)
        if (config.password) delete config.password
        return config
    }
}

module.exports = DatabaseOperations