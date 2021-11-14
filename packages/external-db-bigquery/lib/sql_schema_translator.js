
class SchemaColumnTranslator {

    constructor() {
    }

    translateType(dbType) {
        switch (dbType) {
            case 'NUMERIC':
            case 'INTEGER':
            case 'BIGNUMERIC':
            case 'FLOAT64':
            case 'INT65':
                return 'number'

            case 'TIMESTAMP':
            case 'DATETIME':
            case 'TIME':
            case 'DATE':
                return 'datetime'

            case 'STRING':
                return 'text'
                
            case 'BOOLEAN':
            case 'BOOL':
                return 'boolean'

            default:
                throw Error(`Unknown data type ${dbType}`)
        }
    }

    columnToDbColumnSql(f) {
        return {name : f.name, type: this.dbTypeFor(f), mode: f.isPrimary ? 'REQUIRED' : '' }
    }

    dbTypeFor(f) {
        return this.dbType(f.type, f.subtype, f.precision)
    }

    dbType(type, subtype, precision) {
        switch (`${type.toLowerCase()}_${(subtype || '').toLowerCase()}`) {
            case 'number_int':
                return 'INTEGER'
                
            case 'number_bigint':
                return 'BIGINT'

            case 'number_float':
                return 'DECIMAL'

            case 'number_double':
                return 'BIGDECIMAL'

            case 'number_decimal':
                return 'NUMERIC'

            case 'datetime_date':
                return 'TIMESTAMP'

            case 'datetime_time':
                return 'TIME'

            case 'datetime_timestamp':
            case 'datetime_datetime':
                return 'TIMESTAMP'

            case 'text_string':
                return 'STRING'

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

}

module.exports = SchemaColumnTranslator