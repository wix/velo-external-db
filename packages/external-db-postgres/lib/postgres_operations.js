const translateErrorCodes = require('./sql_exception_translator')

class DatabaseOperations {
    constructor(pool) {
        this.pool = pool;
    }

    async checkIfConnectionSucceeded() {
        await this.pool.query('SELECT 1').catch(translateErrorCodes);
        return Promise.resolve("Connected to DB successfully")
    }
    getPoolConfig() {
        return this.pool.options;
    }
}

module.exports = DatabaseOperations