
class DatabaseOperations {
    constructor(pool) {
        this.pool = pool
    }

    async validateConnection() {
        return await this.pool.query('SELECT 1').then(() => ({ valid: true }))
                              .catch((e) => ({ valid: false, error: e.message }))
    }
}

module.exports = DatabaseOperations