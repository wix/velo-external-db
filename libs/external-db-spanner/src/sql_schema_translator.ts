import { InputField } from '@wix-velo/velo-external-db-types'
import { escapeId } from './spanner_utils'


export interface ISpannerSchemaColumnTranslator {
    translateType(dbType: string): { type: string, subType?: string }
    columnToDbColumnSql(column: InputField): string
}

export default class SchemaColumnTranslator implements ISpannerSchemaColumnTranslator {

    constructor() {
    }

    translateType(dbType: string) {
        const type = dbType.toLowerCase()
            .split('(')
            .shift()

        switch (type) {
            case 'int64':
                return { type: 'number', subtype: 'int' }
           
            case 'numeric':
                return { type: 'number', subtype: 'double' }
            
            case 'float64':
                return { type: 'number', subtype: 'float' }

            case 'date':
                return { type: 'datetime', subtype: 'date' }

            case 'timestamp':
                return { type: 'datetime', subtype: 'timestamp' }

            case 'string':
                return { type: 'text', subtype: 'string' }

            case 'bool':
                return { type: 'boolean' }

            case 'json':
                return { type: 'object' }

            default:
                console.log(type)
                throw Error(type)
        }
    }



    dbTypeFor(f: InputField) {
        return this.dbType(f.type, f.subtype, f.precision)
    }

    columnToDbColumnSql(f: InputField) {
        return `${escapeId(f.name)} ${this.dbTypeFor(f)}`
    }

    dbType(type: string, subtype: any, precision: any) {
        switch (`${type.toLowerCase()}_${(subtype || '').toLowerCase()}`) {
            case 'number_int':
            case 'number_bigint':
                return 'INT64'

            case 'number_float':
            case 'number_decimal':
                return 'FLOAT64'

            case 'number_double':
                return 'NUMERIC'

            case 'datetime_date':
            case 'datetime_year':
                return 'DATE'

            case 'datetime_time':
            case 'datetime_datetime':
            case 'datetime_timestamp':
                return 'TIMESTAMP'

            case 'text_string':
                return `STRING${this.parseLength(precision)}`

            case 'text_small':
                return `STRING${this.parseLength(2 ** 8)}`

            case 'text_medium':
                return `STRING${this.parseLength(2 ** 16)}`

            case 'text_large':
                return `STRING${this.parseLength(2 ** 32)}`

            case 'boolean_':
                return 'BOOL'

            case 'object_':
                return 'JSON'

            default:
                throw new Error(`${type.toLowerCase()}_${(subtype || '').toLowerCase()}`)

        }
    }

    parseLength(length: string | number) {
        try {
            const parsed = parseInt(length as string)
            if (isNaN(parsed) || parsed <= 0) {
                return '(2048)'
            }
            return `(${parsed})`
        } catch (e) {
            return '(2048)'
        }
    }

}
