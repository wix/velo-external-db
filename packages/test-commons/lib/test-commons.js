const { SchemaOperations } = require('velo-external-db-commons')
const { ADD_COLUMN, REMOVE_COLUMN } = SchemaOperations

const Uninitialized = null

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const shouldNotRunOn = (impl, current) => !impl.includes(current)

const shouldRunOnlyOn = (impl, current) => impl.includes(current)

const removeColumnNotIn = (supportedOperations) => !supportedOperations.includes(REMOVE_COLUMN)

const addColumnNotIn = (supportedOperations) => !supportedOperations.includes(ADD_COLUMN)

const passTest = () =>  expect(true).toBe(true)

module.exports = { shouldNotRunOn, shouldRunOnlyOn, sleep, Uninitialized, 
    removeColumnNotIn, addColumnNotIn, passTest }