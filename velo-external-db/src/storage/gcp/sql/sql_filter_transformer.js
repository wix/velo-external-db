class FilterParser {
    constructor() {
    }

    transform(filter) {
        return EMPTY_FILTER;
    }

    isObject(o) {
        return typeof o === 'object' && o !== null
    }

    orderBy(sort) {
        if (!Array.isArray(sort) || !sort.every(this.isObject)) {
            return EMPTY_SORT;
        }

        const results = sort.flatMap( this.parseSort )

        if (results.length === 0) {
            return EMPTY_SORT;
        }

        return {
            sortExpr: `ORDER BY ${results.map( s => s.expr).join(', ')}`,
            sortColumns: [].concat.apply([], results.map( s => s.params ))
        }
    }

    parseSort({ fieldName, direction }) {
        if (typeof fieldName !== 'string') {
            return []
        }
        const _direction = direction || 'ASC'

        const dir = 'ASC' === _direction.toUpperCase() ? 'ASC' : 'DESC';

        return [{
            expr: `?? ${dir}`,
            params: [fieldName]
        }]
    }
}

const EMPTY_SORT = {
    sortExpr: '',
    sortColumns: []
}

const EMPTY_FILTER = {
    filterExpr: '',
    filterColumns: [],
    parameters: []
}

module.exports = {EMPTY_SORT, FilterParser}