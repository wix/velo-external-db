
import { errors } from '@wix-velo/velo-external-db-commons'
import { AdapterFilter as Filter, Sort } from '@wix-velo/velo-external-db-types' 
import { isObject, AdapterOperators, isEmptyFilter } from '@wix-velo/velo-external-db-commons'
import { LastLetterCoder } from './firestore_utils'
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_ends, string_contains, and, or, not, urlized } = AdapterOperators
const { InvalidQuery } = errors

export default class FilterParser {
    constructor() {
    }

    transform(filter: Filter) {
    const results = this.parseFilter(filter)
    
        if (results.length === 0) {
            return []
        }

        return results
    }

    parseFilter(filter: Filter, inlineFields: any = '') {
        if (isEmptyFilter(filter)) {
            return []
        }

        const { operator, fieldName, value } =  filter

        if(this.isUnsupportedOperator(operator)) {
            throw new InvalidQuery(`${operator} operator cant be used in firebase`)
        }

        if(this.isStringBeginsOperator(operator)) {
            return this.parseStringBegins(fieldName, inlineFields, value)
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
            return value.reduce((o: any, f: any) => {
                return o.concat( this.parseFilter.bind(this)(f) )
            }, [])
        }
        
        return []
    }

    isSingleFieldOperator(operator: string) {
        return [ne, lt, lte, gt, gte, include, eq, string_begins, string_ends].includes(operator)
    }

    isStringBeginsOperator(operator: string) {
        return operator === string_begins
    }
    
    isUnsupportedOperator(operator: string) {   
        return [or, urlized, string_contains, not, string_ends].includes(operator)
    }
    
    isMultipleFiledOperator(operator: string) {
        return [and].includes(operator)
    }
    
    valueForOperator(value: any, operator: string) {
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
    
    adapterOperatorToFirestoreOperator(operator: string) {
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
            default:
                return
        }
    }
    
    orderBy(sort: Sort[]) {
        if (!Array.isArray(sort) || !sort.every(isObject)) {
            return []
        }
    
        const results = sort.flatMap( this.parseSort )
    
        if (results.length === 0) {
            return []
        }

        return results

    }
    
    parseSort({ fieldName, direction }: Sort) {
        if (typeof fieldName !== 'string') {
            return []
        }
        const _direction = direction || 'asc'
    
        const dir = 'asc' === _direction.toLowerCase() ? 'asc' : 'desc'
        
        return [{ fieldName, direction: dir }]

    }

    inlineVariableIfNeeded(fieldName: string, inlineFields: {[key: string]: any}) {
        if (inlineFields) {
            if (inlineFields[fieldName]) {
                return inlineFields[fieldName]
            }
        }
        return fieldName
    }

    parseStringBegins(fieldName: string, inlineFields: {[key: string]: any}, value: string) {
        return [{
            fieldName: this.inlineVariableIfNeeded(fieldName, inlineFields),
            opStr: '>=',
            value,
        },
        {
            fieldName: this.inlineVariableIfNeeded(fieldName, inlineFields),
            opStr: '<',
            value: value + LastLetterCoder
        }]
    }

    selectFieldsFor(projection: string[]) { 
        return projection
    }
}