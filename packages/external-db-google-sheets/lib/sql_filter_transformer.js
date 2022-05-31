

const { isEmptyFilter } = require('@wix-velo/velo-external-db-commons')


class FilterParser {
    constructor() {

    }

    transform(filter) {
        const results = this.parseFilter(filter)

        if (results.length === 0) {
            return {}
        }

        return results

    }

    parseFilter(filter) {

        if (isEmptyFilter(filter)) {
            return []
        }

        const { operator, fieldName, value } = filter
        
        if (this.isSingleFieldOperator(operator)) {
            return { filterExpr: operator, fieldName, parameter: value }
        }

        return []
    }

    isSingleFieldOperator(operator) {
        return ['$eq'].includes(operator)
    }
}


module.exports = FilterParser