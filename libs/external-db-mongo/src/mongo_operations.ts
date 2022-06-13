import { errors } from '@wix-velo/velo-external-db-commons'
const { DbConnectionError } = errors
import { isConnected } from './mongo_utils'
import { IDatabaseOperations } from '@wix-velo/velo-external-db-types'

export default class DatabaseOperations implements IDatabaseOperations {
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
        } catch (err: any) {
            return { valid: false, error: new DbConnectionError(err.message) }
        }
    }
}
