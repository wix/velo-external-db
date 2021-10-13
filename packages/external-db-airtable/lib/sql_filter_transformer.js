// const { InvalidQuery } = require('velo-external-db-commons').errors
const { EMPTY_SORT, isObject } = require('velo-external-db-commons')
// const { EMPTY_FILTER } = require('./mongo_utils')

class FilterParser {
    constructor() {
    }

    transform(filter) {
        const results = this.parseFilter(filter)
        if (results.length === 0) {
            return [];
        }
        return {
            filterExpr: results[0].filterExpr
        };
    }


    parseFilter(filter) {
        if (!filter || !isObject(filter) || filter.operator === undefined) {
            return []
        }


        switch (filter.operator) {
            case '$and':
            case '$or':
                const res = filter.value.map(this.parseFilter.bind(this))
                const op = filter.operator === '$and' ? 'AND' : 'OR' 
                return [{
                    filterExpr: this.MultipleFieldOperatorToFilterExpr(op,res)
                }]

            case '$not':
                const res2 = this.parseFilter(filter.value)
                return [{
                    filterExpr: `NOT(${res2[0].filterExpr})`
                }]

        }


        if (this.isSingleFieldOperator(filter.operator)) {
            return [{
                filterExpr: `${filter.fieldName} ${this.veloOperatorToAirtableOperator(filter.operator, filter.value)} "${filter.value}" ` // TODO: value for operator?
            }]
        }

        if (this.isSingleFieldStringOperator(filter.operator)) {
           return[{
               filterExpr: `REGEX_MATCH({${filter.fieldName}},'${this.valueForStringOperator(filter.operator,filter.value)}')`}]
        }

        if (filter.operator === '$urlized') {
            console.error('not implemented');
        }
        return []
    }

    MultipleFieldOperatorToFilterExpr (operator, values) {
        const filterExpr = `${operator}(${values.map(r[0].filterExpr).join(',')}` // with extra comma and without ) 
        return (filterExpr.substring(0,filterExpr.length-1) + ')')
    }

    // }
    // parseAggregation(aggregation, postFilter) {
    //     const havingFilter = this.parseFilter(postFilter)
    //     const fieldsStatement = {}
    //     if (isObject(aggregation._id)) {
    //         const _id = Object.keys(aggregation._id)
    //                                 .reduce((r, c) => Object.assign({}, r, { [aggregation._id[c]]: `$${aggregation._id[c]}` }), {})
    //         Object.assign(fieldsStatement, { _id } )
    //     } else {
    //         Object.assign(fieldsStatement, { [aggregation._id]: `$${aggregation._id}` })
    //     }
    //     Object.keys(aggregation)
    //           .filter(f => f !== '_id')
    //           .forEach(fieldAlias => {
    //               Object.entries(aggregation[fieldAlias])
    //                     .forEach(([func, field]) => {
    //                         Object.assign(fieldsStatement, { [fieldAlias]: { [func]: `$${field}` } })
    //                     })
    //           })
    //     const filterObj = (havingFilter.reduce(((r, c) => Object.assign(r, c)), {}))
    //     return {
    //         fieldsStatement: { $group: fieldsStatement },
    //         havingFilter: { $match: filterObj.filterExpr || {} },
    //     }
    // }


    valueForStringOperator(operator, value) {
        switch (operator) {
            case '$contains':
                return value
            case '$startsWith':
                return `^${value}`
            case '$endsWith':
                return `${value}$`
        }
    }

    isSingleFieldOperator(operator) {
        return ['$ne', '$lt', '$lte', '$gt', '$gte', '$hasSome', '$eq'].includes(operator)
    }

    isSingleFieldStringOperator(operator) {
        return ['$contains', '$startsWith', '$endsWith'].includes(operator)
    }

    // valueForOperator(value, operator) {
    //     if (operator === '$in') {
    //         if (value === undefined || value.length === 0) {
    //             throw new InvalidQuery('$hasSome cannot have an empty list of arguments')
    //         }
    //         return value
    //     }
    //     else if (operator === '$eq' && value === undefined) {
    //         return null
    //     }

    //     return value
    // }

    veloOperatorToAirtableOperator(operator, value) {
        switch (operator) {
            case '$eq':
                if (value !== undefined) {
                    return '='
                }
                break;
            // return 'IS NULL'
            case '$ne':
                return '!='
            case '$lt':
                return '<'
            case '$lte':
                return '<='
            case '$gt':
                return '>'
            case '$gte':
                return '>='
            // case '$hasSome':  // TODO: implement 
            //     return 'IN'
        }
    }

    orderBy(sort) {
        if (!Array.isArray(sort) || !sort.every(isObject)) {
            return [];
        }

        const results=  sort.flatMap(this.parseSort)
        if (results.length === 0) {
            return [];
        }
        return {
            sort: results
        }
    }

    skipExpression(skip) {
        if (!skip) return {}
        return {
            pageSize: 1,
            offset: skip
        }
    }

    parseSort({ fieldName, direction }) {
        if (typeof fieldName !== 'string') {
            return []
        }
        const _direction = direction || 'ASC'

        const dir = 'ASC' === _direction.toUpperCase() ? 'asc' : 'desc';

        return { field: fieldName, direction: dir }

    }

}

module.exports = FilterParser