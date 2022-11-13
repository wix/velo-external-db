import { InputField } from '@wix-velo/velo-external-db-types'
import { escapeIdentifier } from './bigquery_utils'
export default class SchemaColumnTranslator {

    constructor() {
    }

    translateType(dbType: string) {
        const type = dbType.toLowerCase()
                           .split('(')
                           .shift() 
        
        switch (type) {
            case 'numeric':
            case 'integer':
            case 'bignumeric':
            case 'float64':
            case 'int64':
            case 'decimal':
            case 'bigdecimal':
                return 'number'

            case 'timestamp':
            case 'datetime':
            case 'time':
            case 'date':
                return 'datetime'

            case 'string':
                return 'text'
                
            case 'boolean':
            case 'bool':
            case 'bit':
                return 'boolean'

            default:
                console.log('Unknown type', type)
                return 'text'
        }
    }

    columnToDbColumnSql(f: InputField, options = { escapeId: true, precision: true }) {
        return { 
            name: options.escapeId ? escapeIdentifier(f.name) : f.name, 
            type: this.dbTypeFor(f, { precision: options.precision }), 
            mode: f.isPrimary ? 'REQUIRED' : '' 
        }
    }

    dbTypeFor(f: InputField, options = { precision: true }) {
        if (options.precision) {
            return this.dbType(f.type, f.subtype, f.precision as string)
        }
        return this.dbType(f.type, f.subtype)
    }

    dbType(type: string, subtype = '', precision = '') {
        switch (`${type.toLowerCase()}_${(subtype || '').toLowerCase()}`) {
            case 'number_int':
                return 'INTEGER'
                
            case 'number_bigint':
                return 'BIGINT'

            case 'number_double':
                return `BIGDECIMAL${this.parseLength(precision as string)}`

            case 'number_decimal':
            case 'number_float':
                return `NUMERIC${this.parseLength(precision as string)}`

            case 'datetime_date':
                return 'TIMESTAMP'

            case 'datetime_time':
                return 'TIME'

            case 'datetime_timestamp':
            case 'datetime_datetime':
                return 'TIMESTAMP'

            case 'text_string':
                return `STRING${this.parseLength(precision as string)}`

            case 'text_small':
            case 'text_medium':
            case 'text_large':
                return 'STRING'

            case 'boolean_':
                return 'BOOL'

            default:
                throw new Error(`${type.toLowerCase()}_${(subtype || '').toLowerCase()}`)

        }
    }

    parseLength(length = '') {
        const [precision, maximumScale] = length.split(',')
        
        try {
            const parsedPrecision = parseInt(precision)

            if (isNaN(parsedPrecision) || parsedPrecision <= 0) {
                return ''
            }

            if (maximumScale) {
                const parsedMaximumScale = parseInt(maximumScale)

                if (isNaN(parsedMaximumScale) || parsedMaximumScale <= 0) {
                    return ''
                }

                return `(${parsedPrecision},${parsedMaximumScale})`
            }

            return `(${parsedPrecision})`
        } catch (e) {
            return ''
        }
    }


}
