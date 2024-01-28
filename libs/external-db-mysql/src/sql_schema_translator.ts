import { InputField } from '@wix-velo/velo-external-db-types'
import { ILogger } from '@wix-velo/external-db-logger'
import { escapeId } from './mysql_utils'

export default class SchemaColumnTranslato {
    logger?: ILogger
    constructor(logger?: ILogger) {
        this.logger = logger
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
            case 'year':
                return 'number'

            case 'date':
                return 'date'
                
            case 'datetime':
            case 'timestamp':
                return 'datetime'
            
            case 'time':
                return 'time'

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
                this.logger ? this.logger.warn(`Unknown type ${type} returning default type - text`) : console.log(`Unknown type ${type} returning default type - text`)
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
            case 'text_image':
            case 'text_video':
            case 'text_audio':
            case 'text_document':
                return precision ? `VARCHAR${this.parseLength(precision)}` : 'TEXT'

            case 'text_small':
            case 'text_language':
                return 'TEXT'

            case 'text_medium':
                return 'MEDIUMTEXT'

            case 'text_large':
                return 'LONGTEXT'

            case 'boolean_':
            case 'boolean_boolean':
                return 'BOOLEAN'

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
            case 'object_array':
            case 'object_richcontent':
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
