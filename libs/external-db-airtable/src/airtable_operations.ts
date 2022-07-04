
import { notThrowingTranslateErrorCodes } from './sql_exception_translator'
import { Base as AirtableBase} from 'airtable'
import { IDatabaseOperations, ValidateConnectionResult } from '@wix-velo/velo-external-db-types'

export default class DatabaseOperations implements IDatabaseOperations {
    base: AirtableBase
    baseId: string
    constructor(base: any) {
        this.base = base
        this.baseId = base.getId()
    }

    async validateConnection(): Promise<ValidateConnectionResult> {
        try {
            await this.base('Table')
                      .select({})
                      .firstPage()
            return { valid: true }
        } catch (e) {
            if (this.connectionSucceedTableDoesNotExist(e)) return { valid: true }
            return { valid: false, error: notThrowingTranslateErrorCodes(e) }
        }
    }

    connectionSucceedTableDoesNotExist(e: any) {
        return  e.message === `Could not find table Table in application ${this.baseId}`
    }
}
