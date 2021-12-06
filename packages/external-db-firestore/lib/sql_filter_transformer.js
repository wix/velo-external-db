const { InvalidQuery } = require('velo-external-db-commons').errors
const { isObject, getFilterObject } = require('velo-external-db-commons')

class FilterParser {
    constructor() {
    }

    transform(filter) {
    const results = this.parseFilter(filter)
    
        if (results.length === 0) {
            return []
        }

        return results
    }

    parseFilter(filter, inlineFields) {
        if (!filter || !isObject(filter)|| Object.keys(filter)[0] === undefined) {
            return []
        }

        const { operator, fieldName, value } =  getFilterObject(filter)

        if(this.isUnsupportedOperator(operator)) {
            throw new InvalidQuery(`${operator} operator cant be used in firebase`)
        }

        if (this.isSingleFieldOperator(operator)) {
            const _value = this.valueForOperator(value, operator)
    
            return [{
                fieldName: this.inlineVariableIfNeeded(fieldName, inlineFields),
                opStr: this.veloOperatorToFirestoreOperator(operator),
                value: _value,
            }]
        }
        
        if(this.isMultipleFiledOperator(operator)) {
            return value.reduce((o, f) => {
                return o.concat( this.parseFilter.bind(this)(f) )
            }, [])
        }
        
        return []
    }

    isSingleFieldOperator(operator) {
        return ['$ne', '$lt', '$lte', '$gt', '$gte', '$hasSome', '$eq', '$startsWith', '$endsWith'].includes(operator)
    }
    
    isUnsupportedOperator(operator) {
        return ['$or', '$urlized', '$contains', '$not'].includes(operator)
    }
    
    isMultipleFiledOperator(operator) {
        return ['$and'].includes(operator)
    }
    
    valueForOperator(value, operator) {
        if (operator === '$hasSome') {
            if (value === undefined || value.length === 0) {
                throw new InvalidQuery(`${operator} cannot have an empty list of arguments`)
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
            case '$startsWith':
                return '>='
            case '$endsWith':
                return '<'
        }
    }
    
    orderBy(sort) {
        if (!Array.isArray(sort) || !sort.every(isObject)) {
            return []
        }
    
        const results = sort.flatMap( this.parseSort )
    
        if (results.length === 0) {
            return []
        }

        return results

    }
    
    parseSort({ fieldName, direction }) {
        if (typeof fieldName !== 'string') {
            return []
        }
        const _direction = direction || 'asc'
    
        const dir = 'asc' === _direction.toLowerCase() ? 'asc' : 'desc'
        
        return [{ fieldName, direction: dir }]

    }

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