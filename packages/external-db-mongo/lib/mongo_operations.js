const { DbConnectionError } = require('velo-external-db-commons').errors

class DatabaseOperations {
    constructor(client) {
        this.client = client
    }

    async validateConnection() {
        try {
            await this.client.connect()
            return { valid: true }
        } catch (err) {
            return { valid: false, error: new DbConnectionError(err.message) }
        }
    }
}

module.exports = DatabaseOperations
