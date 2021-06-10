class FilterParser {
    constructor() {
    }

    transform(filter) {
        const results = this.parseFilter(filter)

        if (results.length === 0) {
            return EMPTY_FILTER;
        }

        return {
            filterExpr: `WHERE ${results[0].filterExpr}`,
            filterColumns: results[0].filterColumns,
            parameters: results[0].parameters
        };
    }

    isObject(o) {
        return typeof o === 'object' && o !== null
    }

    wixDataFunction2Sql(f) {
        switch (f) {
            case '$avg':
                return 'AVG'
            case '$max':
                return 'MAX'
            case '$min':
                return 'MIN'
            case '$sum':
                return 'SUM'
            default:
                throw new Error(`Unrecognized function ${f}`)
        }
    }

    parseAggregation(aggregation) {
        const filterColumns = []
        const groupByColumns = []
        const filterColumnsStr = []
        if (this.isObject(aggregation._id)) {
            filterColumnsStr.push(...Object.values(aggregation._id).map(() => '??'))
            filterColumns.push(...Object.values(aggregation._id))
            groupByColumns.push(...Object.values(aggregation._id))
        } else {
            filterColumnsStr.push('??')
            filterColumns.push(aggregation._id)
            groupByColumns.push(aggregation._id)
        }

        Object.keys(aggregation)
              .filter(f => f !== '_id')
              .forEach(fieldAlias => {
                  Object.entries(aggregation[fieldAlias])
                        .forEach(([func, field]) => {
                            filterColumnsStr.push(`${this.wixDataFunction2Sql(func)}(??) AS ??`)
                            filterColumns.push(field, fieldAlias)
                        })
              })

        return {
            fieldsStatement: filterColumnsStr.join(', '),
            fieldsStatementColumns: filterColumns,
            groupByColumns,
        }
    }

    parseFilter(filter) {
        if (!filter || !this.isObject(filter)|| filter.operator === undefined) {
            return [];
        }

        switch (filter.operator) {
            case '$and':
            case '$or':
                const res = filter.value.map( this.parseFilter.bind(this) )
                const op = filter.operator === '$and' ? ' AND ' : ' OR '
                return [{
                    filterExpr: res.map(r => r[0].filterExpr).join( op ),
                    filterColumns: res.map( s => s[0].filterColumns ).flat(),
                    parameters: res.map( s => s[0].parameters ).flat()
                }]
            case '$not':
                const res2 = this.parseFilter( filter.value )
                return [{
                    filterExpr: `NOT (${res2[0].filterExpr})`,
                    filterColumns: res2[0].filterColumns,
                    parameters: res2[0].parameters
                }]
        }

        if (this.isSingleFieldOperator(filter.operator)) {
            return [{
                filterExpr: `?? ${this.veloOperatorToMySqlOperator(filter.operator, filter.value)} ${this.valueForOperator(filter.value, filter.operator)}`.trim(),
                filterColumns: [filter.fieldName],
                parameters: filter.value ? [].concat( filter.value ) :  []
            }]
        }

        if (this.isSingleFieldStringOperator(filter.operator)) {
            return [{
                filterExpr: `?? LIKE ?`,
                filterColumns: [filter.fieldName],
                parameters: [this.valueForStringOperator(filter.operator, filter.value)]
            }]
        }

        if (filter.operator === '$urlized') {
            return [{
                filterExpr: 'LOWER(??) RLIKE ?',
                filterColumns: [filter.fieldName],
                parameters: [filter.value.map(s => s.toLowerCase()).join('[- ]')]
            }]
        }

        return []
    }

    valueForStringOperator(operator, value) {
        switch (operator) {
            case '$contains':
                return `%${value}%`
            case '$startsWith':
                return `${value}%`
            case '$endsWith':
                return `%${value}`
        }
    }

    isSingleFieldOperator(operator) {
        return ['$ne', '$lt', '$lte', '$gt', '$gte', '$hasSome', '$eq'].includes(operator)
    }

    isSingleFieldStringOperator(operator) {
        return ['$contains', '$startsWith', '$endsWith'].includes(operator)
    }

    wildCardWith(n, char) {
        return Array(n).fill(char, 0, n).join(', ')
    }

    valueForOperator(value, operator) {
        if (operator === '$hasSome') {
            return `(${this.wildCardWith(value.length, '?')})`
        }
        if (operator === '$eq' && !value) {
            return ''
        }

        return '?'
    }

    veloOperatorToMySqlOperator(operator, value) {
        switch (operator) {
            case '$eq':
                if (value) {
                    return '='
                }
                return 'IS NULL'
            case '$ne':
                return '<>'
            case '$lt':
                return '<'
            case '$lte':
                return '<='
            case '$gt':
                return '>'
            case '$gte':
                return '>='
            case '$hasSome':
                return 'IN'
        }
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
            sortColumns: results.map( s => s.params ).flat()
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

module.exports = { EMPTY_FILTER, EMPTY_SORT, FilterParser }