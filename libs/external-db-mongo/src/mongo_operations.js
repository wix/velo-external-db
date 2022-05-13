const { DbConnectionError } = require('velo-external-db-commons').errors
const { isConnected } = require ('./mongo_utils')
class DatabaseOperations {
    constructor(client) {
        this.client = client
    }

    async validateConnection() {
        try {
            if (isConnected(this.client))
                return { valid: true }
            else {
                const pool = await this.client.connect()
                return pool ? { valid: true } : { valid: false, error: new DbConnectionError('Connection to database failed') }
            }
        } catch (err) {
            return { valid: false, error: new DbConnectionError(err.message) }
        }
    }
}



module.exports = DatabaseOperations
