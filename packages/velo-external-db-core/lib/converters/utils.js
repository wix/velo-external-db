const { AdapterFunctions } = require('velo-external-db-commons')

const EMPTY_FILTER = {}

const projectionFieldFor = (fieldName, fieldAlias) => (
    { name: fieldName.substring(1), alias: fieldAlias || fieldName.substring(1) }
)

const projectionFunctionFor = (fieldName, fieldAlias, func) => {
    if (isCountFunc(func, fieldName))
        return { alias: fieldAlias, function: AdapterFunctions.count }
    return { name: fieldName.substring(1), alias: fieldAlias || fieldName.substring(1), function: func }
}

const isCountFunc = (func, value) => (func === AdapterFunctions.sum && value === 1)

module.exports = { EMPTY_FILTER, projectionFieldFor, projectionFunctionFor }