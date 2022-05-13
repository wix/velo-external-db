
class SchemaColumnTranslator {

    constructor() {
    }

    translateType(dbType) {
        const type = dbType.toLowerCase()
            .split('(')
            .shift()

        switch (type) {
            case 'autonumber':
            case 'count':
            case 'currency':
            case 'duration':
            case 'number':
            case 'rating':
            case 'percent':
                return 'number'

            case 'date':
            case 'createdtime':
            case 'datetime':
                return 'datetime'

            case 'email':
            case 'longtext':
            case 'phonenumber':
            case 'rollup':
            case 'singlelinetext':
            case 'singleselect':
            case 'url':
            case 'multilinetext':
            case 'linkedrecord':
            case 'multiplerecordlinks':
            case 'multipleattachment':
                return 'text'

            case 'checkbox':
                return 'boolean'

            default:
                console.log(type)
                throw Error(type)
        }
    }
    wixColumnToAirtableColumn(column) {
        return { name: column.name, type: this.dbTypeFor(column.type, column.subtype) }
    }
    dbTypeFor(type, subtype) {
        switch (`${type.toLowerCase()}_${(subtype || '').toLowerCase()}`) {
            case 'number_int':
                return { type: 'number', subtype: 'Integer' }

            case 'number_bigint':
            case 'number_float':
            case 'number_double':
            case 'number_decimal':
            case 'datetime_year':
                return 'number'

            case 'datetime_date':
                return 'date'
            case 'datetime_time':
            case 'datetime_datetime':
            case 'datetime_timestamp':
                return 'dateTime'

            case 'text_string':
            case 'text_medium':
            case 'text_large':
                return 'multiLineText'

            case 'text_small':
                return 'singleLineText'

            case 'boolean_':
                return 'checkbox'

        }

    }
}
module.exports = SchemaColumnTranslator