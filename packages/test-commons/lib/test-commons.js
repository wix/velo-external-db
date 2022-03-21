const { SchemaOperations } = require('velo-external-db-commons')
const { AddColumn, RemoveColumn, UpdateImmediately, DeleteImmediately, Truncate, Aggregate, FindWithSort } = SchemaOperations

const Uninitialized = null

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const shouldNotRunOn = (impl, current) => !impl.includes(current)

const shouldRunOnlyOn = (impl, current) => impl.includes(current)

const removeColumnIn = (supportedOperations) => supportedOperations.includes(RemoveColumn)

const addColumnIn = (supportedOperations) => supportedOperations.includes(AddColumn)

const updateImmediatelyIn = (supportedOperations) => supportedOperations.includes(UpdateImmediately)

const deleteImmediatelyIn = (supportedOperations) => supportedOperations.includes(DeleteImmediately)

const truncateIn = (supportedOperations) => supportedOperations.includes(Truncate)

const aggregateIn = (supportedOperations) => supportedOperations.includes(Aggregate)

const findWithSortIn = (supportedOperations) => supportedOperations.includes(FindWithSort)


const testIfSchemaSupportsAddColumn = ( schemaOperations ) => addColumnIn(schemaOperations) ? test : test.skip
const testIfSchemaSupportsRemoveColumn = ( schemaOperations ) => removeColumnIn(schemaOperations) ? test : test.skip
const testIfSchemaSupportsUpdateImmediately = ( schemaOperations ) => updateImmediatelyIn(schemaOperations) ? test : test.skip
const testIfSchemaSupportsDeleteImmediately = ( schemaOperations ) => deleteImmediatelyIn(schemaOperations) ? test : test.skip
const testIfSchemaSupportsTruncate = ( schemaOperations ) => truncateIn(schemaOperations) ? test : test.skip
const testIfSchemaSupportsAggregate = ( schemaOperations ) => aggregateIn(schemaOperations) ? test : test.skip
const testIfSchemaSupportsFindWithSort = ( schemaOperations ) => findWithSortIn(schemaOperations) ? test : test.skip

module.exports = { shouldNotRunOn, shouldRunOnlyOn, sleep, Uninitialized, 
    testIfSchemaSupportsAddColumn, testIfSchemaSupportsRemoveColumn, testIfSchemaSupportsUpdateImmediately,
    testIfSchemaSupportsDeleteImmediately, testIfSchemaSupportsTruncate, 
    testIfSchemaSupportsAggregate, testIfSchemaSupportsFindWithSort }