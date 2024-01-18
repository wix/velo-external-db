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

            case 'time':
                return 'time'
            case 'date':
                return 'date'

            case 'timestamp':
            case 'datetime':
                return 'datetime'

            case 'string':
                return 'text'
                
            case 'boolean':
            case 'bool':
            case 'bit':
                return 'boolean'

            case 'json':
                return 'object'

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
            case 'text_language':
            case 'text_image':
            case 'text_video':
            case 'text_audio':
            case 'text_document':
                return 'STRING'

            case 'boolean_':
            case 'boolean_boolean':
                return 'BOOL'

            case 'object_':
            case 'object_object':
            case 'object_any':
            case 'object_mediagallery':
            case 'object_address':
            case 'object_pagelink':
            case 'object_reference':
            case 'object_multireference':
            case 'object_arraystring':
            case 'object_arraydocument':
            case 'object_richcontent':
            case 'object_array':
                return 'JSON'

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
