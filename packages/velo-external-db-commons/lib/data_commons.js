const moment = require('moment')

const EMPTY_SORT = {
    sortExpr: '',
}

const EMPTY_FILTER = {
    filterExpr: '',
    parameters: [],
    offset: 1
}

const patchDateTime = (item) => {
    const obj = {}
    for (const key of Object.keys(item)) {
        const value = item[key]
        const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/

        if (value instanceof Date) {
            obj[key] = moment(value).format('YYYY-MM-DD HH:mm:ss')
        } else if (reISO.test(value)) {
            obj[key] = moment(new Date(value)).format('YYYY-MM-DD HH:mm:ss')
        } else {
            obj[key] = value
        }
    }
    return obj
}

const asParamArrays = item => Object.values(item)

const isObject = (o) => typeof o === 'object' && o !== null

const updateFieldsFor = item => {
    return Object.keys(item).filter(f => f !== '_id')
}

const extractFilterObjects = (filter) => {
    if(isMultipleFieldOperator(filter)) {
        const operator = Object.keys(filter)[0]
        const value = filter[operator]
        return {
            operator,
            value
        }
    }

    const fieldName = Object.keys(filter)[0]
    const operator = Object.keys(filter[fieldName])[0]
    const value = filter[fieldName][operator]

    return {
        operator,
        fieldName,
        value
    }
}

const patchAggregationObject = (aggregation) => {
    const newAggregationObject = {}
    if (isObject(aggregation._id)) {
        Object.entries(aggregation._id)
              .forEach(([alias, fieldName]) => { 
                  newAggregationObject._id = { ...newAggregationObject._id, ... { [alias]: fieldName.substring(1) } }
              })
    } else {
        newAggregationObject._id = aggregation._id.substring(1)
    }

    Object.keys(aggregation)
          .filter(f => f !== '_id')
          .forEach(fieldAlias => {
              Object.entries(aggregation[fieldAlias])
                    .forEach(([func, field]) => {
                        if (fieldAlias === 'count') {
                            newAggregationObject[fieldAlias] = { ...newAggregationObject[fieldAlias], ...{ $count: '*' } }
                        } else {
                            newAggregationObject[fieldAlias] = { ...newAggregationObject[fieldAlias], ...{ [func]: field.substring(1) } }
                        }
                    })
        })
    return newAggregationObject
}

const isEmptyFilter = (filter) => {
    return (!filter || !isObject(filter)|| Object.keys(filter)[0] === undefined)
} 

const isMultipleFieldOperator = (filter) => { 
    return ['$not', '$or', '$and'].includes(Object.keys(filter)[0])
}


module.exports = { EMPTY_FILTER, EMPTY_SORT, patchDateTime, asParamArrays, isObject, updateFieldsFor,
                     extractFilterObjects, patchAggregationObject, isEmptyFilter }