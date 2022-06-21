import { InputField } from '@wix-velo/velo-external-db-types' 
import { escapeIdentifier } from './postgres_utils'


export default class SchemaColumnTranslator {

    public constructor() {
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
            case 'time':
            case 'timez':
            case 'timestamp':
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
                return 'boolean'

            case 'json':
                return 'object'    

            default:
                console.log(type)
                throw Error(type)
        }
    }

    columnToDbColumnSql(f: InputField) {
        return `${escapeIdentifier(f.name)} ${this.dbTypeFor(f)}`
    }

    dbTypeFor(f: InputField) {
        return this.dbType(f.type, f.subtype, f.precision)
    }

    dbType(type: string, subtype: string | undefined , precision: string | undefined) {
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
                return `varchar${this.parseLength(precision)}`

            case 'text_small':
            case 'text_medium':
            case 'text_large':
                return 'text'

            case 'boolean_':
                return 'boolean'

            case 'object_':
                return 'json'

            default:
                throw new Error(`${type.toLowerCase()}_${(subtype || '').toLowerCase()}`)

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
