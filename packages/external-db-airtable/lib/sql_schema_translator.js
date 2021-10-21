
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

}

module.exports = SchemaColumnTranslator