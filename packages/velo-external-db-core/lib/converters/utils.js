const { AdapterFunctions } = require('@wix-velo/velo-external-db-commons')

const EmptyFilter = {}

const projectionFieldFor = (fieldName, fieldAlias) => {
    const field = { name: fieldName.substring(1) }
    return fieldAlias ? { ...field, ...{ alias: fieldAlias } } : field
}

const projectionFunctionFor = (fieldName, fieldAlias, func) => {
    if (isCountFunc(func, fieldName))
        return { alias: fieldAlias, function: AdapterFunctions.count, name: '*' }
    return { name: fieldName.substring(1), alias: fieldAlias || fieldName.substring(1), function: func }
}

const isCountFunc = (func, value) => (func === AdapterFunctions.sum && value === 1)

module.exports = { EmptyFilter, projectionFieldFor, projectionFunctionFor }