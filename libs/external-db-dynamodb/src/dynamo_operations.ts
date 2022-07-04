import { IDatabaseOperations } from '@wix-velo/velo-external-db-types'
import { notThrowingTranslateErrorCodes } from './sql_exception_translator'

export default class DatabaseOperations implements IDatabaseOperations {
    client: any
    constructor(client: any) {
        this.client = client
    }

    async validateConnection() {
        return await this.client.listTables({}).then(() => { return { valid: true } })
                                               .catch((e: any) => { return { valid: false, error: notThrowingTranslateErrorCodes(e) } })
    }
}
