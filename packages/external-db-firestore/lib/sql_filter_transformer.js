const { InvalidQuery } = require('velo-external-db-commons').errors
const { EMPTY_FILTER, isObject } = require('velo-external-db-commons')
const { /*escapeId,*/ validateLiteral } = require('./firestore_utils')


class FilterParser {
    constructor() {
    }

    transform(filter) {
    const results = this.parseFilter(filter)
    
        if (results.length === 0) {
            return [];
        }

        return results
    }

    parseFilter(filter, inlineFields) {
        if (!filter || !isObject(filter)|| filter.operator === undefined) {
            return []
        }
    
        switch (filter.operator) {  
            case '$and':
                return filter.value.reduce((o, f) => {
                                return o.concat( this.parseFilter.bind(this)(f) )
                            }, [])
            case '$or':
            case '$urlized':
            case '$contains':
                throw new InvalidQuery(`${filter.operator} operator cant be used in firebase`)

        }

        if (this.isSingleFieldOperator(filter.operator)) {
            const value = this.valueForOperator(filter.fieldName, filter.value, filter.operator)
    
            return [{
                fieldName: this.inlineVariableIfNeeded(filter.fieldName, inlineFields),
                opStr: this.veloOperatorToFirestoreOperator(filter.operator),
                value,
            }]
        }
    
        if (this.isSingleFieldStringOperator(filter.operator)) {
            const value = this.valueForOperator(filter.fieldName, filter.value, filter.operator)
            return [{
                fieldName: this.inlineVariableIfNeeded(filter.fieldName, inlineFields),
                opStr: this.valueForStringOperator(filter.operator, filter.value),
                value,
            }]
        }
        
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
    valueForStringOperator(operator, value) {
        switch (operator) {
            case '$startsWith':
                return '>='
            case '$endsWith':
                return '<'
        }
    }
    
    isSingleFieldOperator(operator) {
        return ['$ne', '$lt', '$lte', '$gt', '$gte', '$hasSome', '$eq'].includes(operator)
    }
    
    isSingleFieldStringOperator(operator) {
        return ['$startsWith', '$endsWith'].includes(operator)
    }
    
    // fix this function to test that not more than 10 equality 
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
            return null
        }
        
        return value
    }
    
    veloOperatorToFirestoreOperator(operator) {
        switch (operator) {
            case '$eq':
                return '=='
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
            return [];
        }
    
        const results = sort.flatMap( this.parseSort )
    
        if (results.length === 0) {
            return [];
        }

        return results

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