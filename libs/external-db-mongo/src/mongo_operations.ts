const { DbConnectionError } = require('@wix-velo/velo-external-db-commons').errors
import { isConnected } from './mongo_utils'
export default class DatabaseOperations {
    client: any
    constructor(client: any) {
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
