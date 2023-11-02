import { InputField } from '@wix-velo/velo-external-db-types'
import { escapeId } from './mysql_utils'

export default class SchemaColumnTranslato {
    constructor() {
    }

    translateType(dbType: string) {
        const type = dbType.toLowerCase()
            .split('(')
            .shift()

        switch (type) {
            case 'int':
            case 'integer':
            case 'bigint':
            case 'smallint':
            case 'float':
            case 'double':
            case 'decimal':
                return 'number'

            case 'date':
            case 'datetime':
            case 'timestamp':
            case 'time':
            case 'year':
                return 'datetime'

            case 'varchar':
            case 'text':
            case 'mediumtext':
            case 'longtext':
                return 'text'

            case 'tinyint':
            case 'bit':
            case 'boolean':
            case 'bool':
                return 'boolean'

            case 'json':
                return 'object'

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

            case 'number_float':
                return `FLOAT${this.parsePrecision(precision)}`

            case 'number_double':
                return `DOUBLE${this.parsePrecision(precision)}`

            case 'number_decimal':
                return `DECIMAL${this.parsePrecision(precision)}`

            case 'datetime_date':
                return 'DATE'

            case 'datetime_time':
                return 'TIME'

            case 'datetime_year':
                return 'YEAR'

            case 'datetime_datetime':
                return 'DATETIME'

            case 'datetime_timestamp':
                return 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'

            case 'text_string':
                return `VARCHAR${this.parseLength(precision)}`

            case 'text_small':
                return 'TEXT'

            case 'text_medium':
                return 'MEDIUMTEXT'

            case 'text_large':
            case 'text_language':
                return 'LONGTEXT'

            case 'boolean_':
            case 'boolean_boolean':
                return 'BOOLEAN'

            case 'object_':
            case 'object_object':
            case 'object_image':
            case 'object_document':
            case 'object_video':
            case 'object_any':
            case 'object_audio':
            case 'object_mediaGallery':
            case 'object_address':
            case 'object_pageLink':
            case 'object_reference':
            case 'object_multiReference':
            case 'object_arrayString':
            case 'object_arrayDocument':
            case 'object_richContent':
                return 'JSON'

            default:
                throw new Error(`${type.toLowerCase()}_${(subtype || '').toLowerCase()}`)

        }
    }

    parsePrecision(precision: string) {
        try {
            const parsed = precision.split(',').map((s: string) => s.trim()).map((s: string) => parseInt(s))
            return `(${parsed.join(',')})`
        } catch (e) {
            return '(15,2)'
        }
    }

    parseLength(length: string) {
        try {
            const parsed = parseInt(length)
            if (isNaN(parsed) || parsed <= 0) {
                return '(2048)'
            }
            return `(${parsed})`
        } catch (e) {
            return '(2048)'
        }
    }

}
