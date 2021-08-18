const { escapeId } = require('mysql')

class SchemaColumnTranslator {

    constructor() {
    }

    translateType(dbType) {
        const type = dbType.toLowerCase()
            .split('(')
            .shift()

        switch (type) {
            // case 'int':
            // case 'integer':
            // case 'bigint':
            // case 'smallint':
            // case 'float':
            // case 'double':
            // case 'decimal':
            case 'float64':
            case 'int64':
                return 'number'
            //
            // case 'date':
            // case 'datetime':
            case 'timestamp':
            // case 'time':
            // case 'year':
                return 'datetime'
            //
            // case 'varchar':
            // case 'text':
            // case 'mediumtext':
            // case 'longtext':
            case 'string':
                return 'text'
            //
            // case 'tinyint':
            //     return 'boolean'

            default:
                console.log(type)
                throw Error(type)
        }
    }



    dbTypeFor(f) {
        return this.dbType(f.type, f.subtype, f.precision)
    }

    columnToDbColumnSql(f) {
        return `${escapeId(f.name)} ${this.dbTypeFor(f)}`
    }

    /*
    const SystemFields = [
    {
        name: 'id_', type: 'STRING(256)', isPrimary: true
    },
    {
        name: 'createdDate_', type: 'TIMESTAMP'
    },
    {
        name: 'updatedDate_', type: 'TIMESTAMP'
    },
    {
        name: 'owner_', type: 'STRING(256)'
    }]

     */

    dbType(type, subtype, precision) {
        switch (`${type.toLowerCase()}_${(subtype || '').toLowerCase()}`) {
            case 'number_int':
                return 'INT64'

            // case 'number_bigint':
            //     return 'BIGINT'
            //
            // case 'number_float':
            //     return `FLOAT${this.parsePrecision(precision)}`
            //
            // case 'number_double':
            //     return `DOUBLE${this.parsePrecision(precision)}`
            //
            case 'number_decimal':
                return 'FLOAT64'
            //
            // case 'datetime_date':
            //     return `DATE`
            //
            // case 'datetime_time':
            //     return `TIME`
            //
            // case 'datetime_year':
            //     return `YEAR`
            //
            case 'datetime_datetime':
                // return `DATETIME`

            case 'datetime_timestamp':
                return `TIMESTAMP`
            // NOT NULL OPTIONS (allow_commit_timestamp=true)
                // return `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
                // return `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`

            case 'text_string':
                return `STRING${this.parseLength(precision)}`
            //
            // case 'text_small':
            //     return `TEXT`
            //
            // case 'text_medium':
            //     return `MEDIUMTEXT`
            //
            // case 'text_large':
            //     return `LONGTEXT`
            //
            // case 'boolean_':
            //     return `BOOLEAN`

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