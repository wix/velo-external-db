const translateErrorCodes = require('./sql_exception_translator')

class DatabaseOperations {
    constructor(pool) {
        this.pool = pool;
    }

    async checkIfConnectionSucceeded() {
        return await this.pool.query('SELECT 1').catch(translateErrorCodes);
    }
}

module.exports = DatabaseOperations