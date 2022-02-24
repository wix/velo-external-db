const { SchemaOperations } = require('velo-external-db-commons')
const { AddColumn, RemoveColumn } = SchemaOperations

const suitDef = (name, setup) => ( { name, setup } )

const Uninitialized = null

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const shouldNotRunOn = (impl, current) => !impl.includes(current)

const shouldRunOnlyOn = (impl, current) => impl.includes(current)

const removeColumnNotIn = (supportedOperations) => !supportedOperations.includes(RemoveColumn)

const addColumnNotIn = (supportedOperations) => !supportedOperations.includes(AddColumn)

const testIfSchemaSupportsAddColumn = async({ schemaOperations }, f) => {
    if (!addColumnNotIn(schemaOperations)) {
        return await f()
    }
}

const testIfSchemaSupportsRemoveColumn = async({ schemaOperations }, f) => {
    if (!removeColumnNotIn(schemaOperations)) {
        return await f()
    }
}

module.exports = { shouldNotRunOn, shouldRunOnlyOn, sleep, Uninitialized, 
    testIfSchemaSupportsAddColumn, testIfSchemaSupportsRemoveColumn, suitDef }