const { InvalidQuery } = require('velo-external-db-commons').errors
const { EMPTY_FILTER, isObject } = require('velo-external-db-commons')
const { /*escapeId,*/ validateLiteral } = require('./firestore_utils')

const EMPTY_SORT = {}

class FilterParser {
    constructor() {
    }

    transform(filter) {
    const results = this.parseFilter(filter)
    
        if (results.length === 0) {
            return EMPTY_FILTER;
        }
    
        // return {
        //     filterExpr: `WHERE ${results[0].filterExpr}`,
        //     parameters: results[0].parameters
        // };

        return results
    }
    //
    // wixDataFunction2Sql(f) {
    //     switch (f) {
    //         case '$avg':
    //             return 'AVG'
    //         case '$max':
    //             return 'MAX'
    //         case '$min':
    //             return 'MIN'
    //         case '$sum':
    //             return 'SUM'
    //         default:
    //             throw new InvalidQuery(`Unrecognized function ${f}`)
    //     }
    // }
    //
    // parseAggregation(aggregation, postFilter) {
    //     const groupByColumns = []
    //     const filterColumnsStr = []
    //     if (isObject(aggregation._id)) {
    //         filterColumnsStr.push(...Object.values(aggregation._id).map( escapeId ))
    //         groupByColumns.push(...Object.values(aggregation._id))
    //     } else {
    //         filterColumnsStr.push(escapeId(aggregation._id))
    //         groupByColumns.push(aggregation._id)
    //     }
    //
    //     const aliasToFunction = {}
    //     Object.keys(aggregation)
    //           .filter(f => f !== '_id')
    //           .forEach(fieldAlias => {
    //               Object.entries(aggregation[fieldAlias])
    //                     .forEach(([func, field]) => {
    //                         filterColumnsStr.push(`${this.wixDataFunction2Sql(func)}(${escapeId(field)}) AS ${escapeId(fieldAlias)}`)
    //                         aliasToFunction[fieldAlias] = `${this.wixDataFunction2Sql(func)}(${escapeId(field)})`
    //                     })
    //           })
    //
    //     const havingFilter = this.parseFilter(postFilter, aliasToFunction)
    //
    //     const {filterExpr, parameters} =
    //         havingFilter.map(({filterExpr, parameters}) => ({ filterExpr: filterExpr !== '' ? `HAVING ${filterExpr}` : '',
    //                                                           parameters: parameters}))
    //                     .concat({ filterExpr: '', parameters: {}})[0]
    //
    //
    //     return {
    //         fieldsStatement: filterColumnsStr.join(', '),
    //         groupByColumns,
    //         havingFilter: filterExpr,
    //         parameters: parameters,
    //     }
    // }
    //
    parseFilter(filter, inlineFields) {
        if (!filter || !isObject(filter)|| filter.operator === undefined) {
            return []
        }
    
        // switch (filter.operator) {
        //     case '$and':
        //     case '$or':
        //         const res = filter.value.reduce((o, f) => {
        //             const res = this.parseFilter.bind(this)(f, inlineFields)
        //             return {
        //                 filter: o.filter.concat( ...res ),
        //             }
        //         }, { filter: []})
        //         const op = filter.operator === '$and' ? ' AND ' : ' OR '
        //         return [{
        //             filterExpr: res.filter.map(r => r.filterExpr).join( op ),
        //             parameters: res.filter.reduce((o, s) => Object.assign({}, o, s.parameters), {} )
        //         }]
        //     case '$not':
        //         const res2 = this.parseFilter( filter.value, inlineFields )
        //         return [{
        //             filterExpr: `NOT (${res2[0].filterExpr})`,
        //             parameters: res2[0].parameters
        //         }]
        // }
    
        if (this.isSingleFieldOperator(filter.operator)) {
            const value = this.valueForOperator(filter.fieldName, filter.value, filter.operator)
    
            return [{
                fieldName: this.inlineVariableIfNeeded(filter.fieldName, inlineFields),
                opStr: this.veloOperatorToMySqlOperator(filter.operator, filter.value),
                value,
            }]
        }
    
        // if (this.isSingleFieldStringOperator(filter.operator)) {
        //     return [{
        //         filterExpr: `${this.inlineVariableIfNeeded(filter.fieldName, inlineFields)} LIKE ${validateLiteral(filter.fieldName)}`,
        //         parameters: { [filter.fieldName]: this.valueForStringOperator(filter.operator, filter.value)}
        //     }]
        // }
    
        // if (filter.operator === '$urlized') {
        //     return [{
        //         filterExpr: `LOWER(${escapeId(filter.fieldName)}) RLIKE ${validateLiteral(filter.fieldName)}`,
        //         parameters: { [filter.fieldName]: filter.value.map(s => s.toLowerCase()).join('[- ]') }
        //     }]
        // }
    
        return []
    }
    //
    // parametersFor(name, value) {
    //     if (value !== undefined) {
    //         if (!Array.isArray(value)) {
    //             return { [name]: this.patchTrueFalseValue(value) }
    //         } else {
    //             return value.reduce((o, v, i) => Object.assign({}, o, { [`${name}${i + 1}`]: v}), {})
    //         }
    //     }
    //     return { }
    // }
    //
    // valueForStringOperator(operator, value) {
    //     switch (operator) {
    //         case '$contains':
    //             return `%${value}%`
    //         case '$startsWith':
    //             return `${value}%`
    //         case '$endsWith':
    //             return `%${value}`
    //     }
    // }
    //
    isSingleFieldOperator(operator) {
        return ['$ne', '$lt', '$lte', '$gt', '$gte', '$hasSome', '$eq'].includes(operator)
    }
    
    // isSingleFieldStringOperator(operator) {
    //     return ['$contains', '$startsWith', '$endsWith'].includes(operator)
    // }
    
    // fix this function
    prepareStatementVariables(n, fieldName) {
        return Array.from({length: n}, (_, i) => validateLiteral(`${fieldName}${i + 1}`) )
                    .join(', ')
    }
    
    
    valueForOperator(fieldName, value, operator) {
        if (operator === '$hasSome') {
            if (value === undefined || value.length === 0) {
                throw new InvalidQuery('$hasSome cannot have an empty list of arguments')
            }
            return value  
        } else if (operator === '$eq' && value === undefined) {
            return ''
        }
        
        // return validateLiteral(fieldName)
        return value
    }
    
    veloOperatorToMySqlOperator(operator, value) {
        switch (operator) {
            case '$eq':
                if (value !== undefined) {
                    return '=='
                }
                // what to do with this?
                return 'IS NULL'
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
            case '$hasSome':
                return 'in'
        }
    }
    
    orderBy(sort) {
        if (!Array.isArray(sort) || !sort.every(isObject)) {
            return EMPTY_SORT;
        }
    
        const results = sort.flatMap( this.parseSort )
    
        if (results.length === 0) {
            return EMPTY_SORT;
        }

        return {
            sortOperations: results
        }

    }
    
    parseSort({ fieldName, direction }) {
        if (typeof fieldName !== 'string') {
            return []
        }
        const _direction = direction || 'asc'
    
        const dir = 'asc' === _direction.toLowerCase() ? 'asc' : 'desc'
        
        // should I escape the fieldName?
        return [{fieldName, direction: dir}]

    }
    //
    // patchTrueFalseValue(value) {
    //     if (value === true || value === false) {
    //         return value ? 1 : 0
    //     }
    //     return value
    // }
    //
    inlineVariableIfNeeded(fieldName, inlineFields) {
        if (inlineFields) {
            if (inlineFields[fieldName]) {
                return inlineFields[fieldName]
            }
        }
        return fieldName
    }
}

module.exports = FilterParser