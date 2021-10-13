// const { escapeId } = require('./mysql_utils')

// class SchemaColumnTranslator {

//     constructor() {
//     }

//     translateType(dbType) {
//         const type = dbType.toLowerCase()
//             .split('(')
//             .shift()

//         switch (type) {
//             case 'int':
//             case 'integer':
//             case 'bigint':
//             case 'smallint':
//             case 'float':
//             case 'double':
//             case 'decimal':
//                 return 'number'

//             case 'date':
//             case 'datetime':
//             case 'timestamp':
//             case 'time':
//             case 'year':
//                 return 'datetime'

//             case 'varchar':
//             case 'text':
//             case 'mediumtext':
//             case 'longtext':
//                 return 'text'

//             case 'tinyint':
//                 return 'boolean'

//             default:
//                 console.log(type)
//                 throw Error(type)
//         }
//     }


//     columnToDbColumnSql(f) {
//         return `${escapeId(f.name)} ${this.dbTypeFor(f)}`
//     }

//     dbTypeFor(f) {
//         return this.dbType(f.type, f.subtype, f.precision)
//     }

//     dbType(type, subtype, precision) {
//         switch (`${type.toLowerCase()}_${(subtype || '').toLowerCase()}`) {
//             case 'number_int':
//                 return 'INT'

//             case 'number_bigint':
//                 return 'BIGINT'

//             case 'number_float':
//                 return `FLOAT${this.parsePrecision(precision)}`

//             case 'number_double':
//                 return `DOUBLE${this.parsePrecision(precision)}`

//             case 'number_decimal':
//                 return `DECIMAL${this.parsePrecision(precision)}`

//             case 'datetime_date':
//                 return `DATE`

//             case 'datetime_time':
//                 return `TIME`

//             case 'datetime_year':
//                 return `YEAR`

//             case 'datetime_datetime':
//                 return `DATETIME`

//             case 'datetime_timestamp':
//                 return `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`

//             case 'text_string':
//                 return `VARCHAR${this.parseLength(precision)}`

//             case 'text_small':
//                 return `TEXT`

//             case 'text_medium':
//                 return `MEDIUMTEXT`

//             case 'text_large':
//                 return `LONGTEXT`

//             case 'boolean_':
//                 return `BOOLEAN`

//             default:
//                 throw new Error(`${type.toLowerCase()}_${(subtype || '').toLowerCase()}`)

//         }
//     }

//     parsePrecision(precision) {
//         try {
//             const parsed = precision.split(',').map(s => s.trim()).map(s => parseInt(s))
//             return `(${parsed.join(',')})`
//         } catch (e) {
//             return '(5,2)'
//         }
//     }

//     parseLength(length) {
//         try {
//             const parsed = parseInt(length)
//             if (isNaN(parsed) || parsed <= 0) {
//                 return '(2048)'
//             }
//             return `(${parsed})`
//         } catch (e) {
//             return '(2048)'
//         }
//     }

// }

// module.exports = SchemaColumnTranslator