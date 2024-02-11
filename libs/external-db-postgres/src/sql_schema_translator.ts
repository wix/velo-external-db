import { ILogger } from '@wix-velo/external-db-logger'
import { InputField } from '@wix-velo/velo-external-db-types' 
import { escapeIdentifier,  } from './postgres_utils'


export default class SchemaColumnTranslator {
    logger?: ILogger

    public constructor(logger?: ILogger) {
        this.logger = logger
    }

    translateType(dbType: string) {
        const type = dbType.toLowerCase()
                           .split('(')
                           .shift()

        switch (type) {
            case 'int':
            case 'int2':
            case 'int4':
            case 'int8':
            case 'smallint':
            case 'integer':
            case 'bigint':
            case 'serial':
            case 'smallserial':
            case 'bigserial':
            case 'decimal':
            case 'numeric':
            case 'real':
            case 'double precision':
            case 'float4':
            case 'float8':
            case 'oid':
            case 'money':
                return 'number'

            case 'date':
                return 'date'
            case 'time':
                return 'time'

            case 'timestamp':
            case 'timez':
            case 'timestamptz':
                return 'datetime'

            case 'character':
            case 'character varying':
            case 'varchar':
            case 'char':
            case 'text':
                return 'text'
                
            case 'bool':
            case 'boolean':
            case 'bit':
                return 'boolean'

            case 'json':
                return 'object'    

            default:
                this.logger ? this.logger.warn(`Unknown type ${type} returning default type - text`) : console.log(`Unknown type ${type} returning default type - text`)
                return 'text'
        }
    }

    columnToDbColumnSql(f: InputField) {
        return `${escapeIdentifier(f.name)} ${this.dbTypeFor(f)}`
    }

    dbTypeFor(f: InputField) {
        return this.dbType(f.type, f.subtype, f.precision as string)
    }

    dbType(type: string, subtype: string | undefined, precision: string | undefined) {
        switch (`${type.toLowerCase()}_${(subtype || '').toLowerCase()}`) {
            case 'number_int':
                return 'integer'

            case 'number_bigint':
                return 'bigint'

            case 'number_float':
                return 'decimal'

            case 'number_double':
                return 'double precision'

            case 'number_decimal':
                return 'real'

            case 'datetime_date':
                return 'date'

            case 'datetime_time':
                return 'time'

            case 'datetime_timestamp':
            case 'datetime_datetime':
                return 'timestamp'

            case 'text_string':
            case 'text_image':
            case 'text_video':
            case 'text_audio':
            case 'text_document':
                return precision ? `varchar${this.parseLength(precision)}` : 'text'

            case 'text_small':
            case 'text_medium':
            case 'text_large':
            case 'text_language':
                return 'text'

            case 'boolean_':
            case 'boolean_boolean':
                return 'boolean'

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
                return 'json'

            default:
                throw new Error(`Unknow type ${type.toLowerCase()}_${(subtype || '').toLowerCase()}`)

        }
    }

    parseLength(length = '') {
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
