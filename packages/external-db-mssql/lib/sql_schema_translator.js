const { escapeId } = require('./mssql_utils')

class SchemaColumnTranslator {

    constructor() {
    }

    translateType(dbType) {
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

            case 'date':
            case 'datetime':
            case 'datetime2':
            case 'time':
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
                return 'boolean'

            default:
                console.log(type)
                throw Error(type)
        }
    }


    columnToDbColumnSql(f) {
        return `${escapeId(f.name)} ${this.dbTypeFor(f)}`
    }

    dbTypeFor(f) {
        return this.dbType(f.type, f.subtype, f.precision)
    }

    dbType(type, subtype, precision) {
        switch (`${type.toLowerCase()}_${(subtype || '').toLowerCase()}`) {
            case 'number_int':
                return 'INT'

            case 'number_bigint':
                return 'BIGINT'

            case 'number_float':
                return `FLOAT${this.parsePrecision(precision)}`

            case 'number_double':
                return `REAL${this.parsePrecision(precision)}`

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
                return `VARCHAR${this.parseLength(precision)}`

            case 'text_small':
            case 'text_medium':
            case 'text_large':
                return 'TEXT'


            case 'boolean_':
                return 'TINYINT'

            default:
                throw new Error(`${type.toLowerCase()}_${(subtype || '').toLowerCase()}`)

        }
    }

    parsePrecision(precision) {
        try {
            const parsed = precision.split(',').map(s => s.trim()).map(s => parseInt(s))
            return `(${parsed.join(',')})`
        } catch (e) {
            return '(5,2)'
        }
    }

    parseLength(length) {
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

module.exports = SchemaColumnTranslator