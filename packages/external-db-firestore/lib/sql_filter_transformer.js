const { InvalidQuery } = require('velo-external-db-commons').errors
const { isObject, AdapterOperators, isEmptyFilter } = require('velo-external-db-commons')
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_ends, string_contains, and, or, not, urlized } = AdapterOperators

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
        if (isEmptyFilter(filter)) {
            return []
        }

        const { operator, fieldName, value } =  filter

        if(this.isUnsupportedOperator(operator)) {
            throw new InvalidQuery(`${operator} operator cant be used in firebase`)
        }

        if (this.isSingleFieldOperator(operator)) {
            const _value = this.valueForOperator(value, operator)
    
            return [{
                fieldName: this.inlineVariableIfNeeded(fieldName, inlineFields),
                opStr: this.adapterOperatorToFirestoreOperator(operator),
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
        return [ne, lt, lte, gt, gte, include, eq, string_begins, string_ends].includes(operator)
    }
    
    isUnsupportedOperator(operator) {
        return [or, urlized, string_contains, not].includes(operator)
    }
    
    isMultipleFiledOperator(operator) {
        return [and].includes(operator)
    }
    
    valueForOperator(value, operator) {
        if (operator === include) {
            if (value === undefined || value.length === 0) {
                throw new InvalidQuery(`${operator} cannot have an empty list of arguments`)
            }
            return value  
        } else if (operator === eq && value === undefined) {
            return null
        }
        
        return value
    }
    
    adapterOperatorToFirestoreOperator(operator) {
        switch (operator) {
            case eq:
                return '=='
            case ne:
                return '!='
            case lt:
                return '<'
            case lte:
                return '<='
            case gt:
                return '>'
            case gte:
                return '>='
            case include:
                return 'in'
            case string_begins: // TODO: fix string_begins, string_ends, shouldn't work like this
                return '>='
            case string_ends:
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