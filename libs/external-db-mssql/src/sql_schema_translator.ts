import { escapeId } from './mssql_utils'
import { InputField } from '@wix-velo/velo-external-db-types'

export default class SchemaColumnTranslator {
    constructor() {
    }

    translateType(dbType: string) {
        const type = dbType.toLowerCase()
            .split('(')
            .shift()

        switch (type) {
            case 'int':
            case 'bigint':
            case 'float':
            case 'real':
            case 'decimal':
            case 'numeric':
                return 'number'
                
            case 'time':
                return 'time'
            case 'date':
                return 'date'

            case 'datetime':
            case 'datetime2':
            case 'datetimeoffset':
            case 'smalldatetime':
                return 'datetime'

            case 'nchar':
            case 'nvarchar':
            case 'ntext':
            case 'char':
            case 'varchar':
            case 'text':
                return 'text'

            case 'tinyint':
            case 'bit':
                return 'boolean'

            default:
                console.log('Unknown type', type)
                return 'text'
        }
    }


    columnToDbColumnSql(f: InputField) {
        return `${escapeId(f.name)} ${this.dbTypeFor(f)}`
    }

    dbTypeFor(f: InputField) {
        return this.dbType(f.type, f.subtype, f.precision)
    }

    dbType(type: string, subtype: any, precision: any) {
        switch (`${type.toLowerCase()}_${(subtype || '').toLowerCase()}`) {
            case 'number_int':
                return 'INT'

            case 'number_bigint':
                return 'BIGINT'
  
            case 'number_double':
                return `REAL${this.parsePrecision(precision)}`

            case 'number_float':
            case 'number_decimal':
                return `DECIMAL${this.parsePrecision(precision)}`

            case 'datetime_date':
                return 'DATE'

            case 'datetime_time':
                return 'TIME'

            case 'datetime_timestamp':
            case 'datetime_datetime':
                return 'DATETIME2'

            case 'datetime_year':
                return 'SMALLDATETIME'

            case 'text_string':
            case 'text_image':
            case 'text_video':
            case 'text_audio':
            case 'text_document':
            case 'text_language':
                return `VARCHAR${this.parseLength(precision)}`

            case 'text_small':
            case 'text_medium':
            case 'text_large':
                return 'TEXT'


            case 'boolean_':
            case 'boolean_boolean':
                return 'TINYINT'

            default:
                throw new Error(`${type.toLowerCase()}_${(subtype || '').toLowerCase()}`)

        }
    }

    parsePrecision(precision: string) {
        try {
            const parsed = precision.split(',').map((s: string) => s.trim()).map((s: string) => parseInt(s))
            return `(${parsed.join(',')})`
        } catch (e) {
            return '(15, 2)'
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
