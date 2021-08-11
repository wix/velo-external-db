const { promisify } = require('util')
const translateErrorCodes = require('./sql_exception_translator')

class DatabaseOperations {
    constructor(pool) {
        this.pool = pool;
        this.query = promisify(this.pool.query).bind(this.pool);
    }

    async checkIfConnectionSucceeded() {
        await this.query('SELECT 1').catch(translateErrorCodes);
        return Promise.resolve("Connected to DB successfully")
    }
    getPoolConfig() {
        return this.pool.config.connectionConfig
    }
}

module.exports = DatabaseOperations