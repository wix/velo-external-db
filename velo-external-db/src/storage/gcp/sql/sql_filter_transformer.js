class FilterParser {
    constructor(/*pool*/) {
        // this.pool = pool
    }

    transform(filter) {
        return {
            filterExpr: '',
            filterColumns: [],
            parameters: []
        }
    }

    orderBy(orderBy) {
        return {
            sortExpr: '',
            sortColumns: []
        }
    }
}

module.exports = FilterParser