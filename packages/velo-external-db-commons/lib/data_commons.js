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
    // const systemFieldNames = SystemFields.map(f => f.name)
    // return Object.keys(item)
    //              .filter( k => !systemFieldNames.includes(k) )
    return Object.keys(item).filter(f => f !== '_id')
}


module.exports = { EMPTY_FILTER, EMPTY_SORT, patchDateTime, asParamArrays, isObject, updateFieldsFor }