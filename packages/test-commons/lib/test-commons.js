const { SchemaOperations } = require('velo-external-db-commons')
const { AddColumn, RemoveColumn } = SchemaOperations

const Uninitialized = null

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const shouldNotRunOn = (impl, current) => !impl.includes(current)

const shouldRunOnlyOn = (impl, current) => impl.includes(current)

const removeColumnNotIn = (supportedOperations) => !supportedOperations.includes(RemoveColumn)

const addColumnNotIn = (supportedOperations) => !supportedOperations.includes(AddColumn)

const passTest = () =>  expect(true).toBe(true)

module.exports = { shouldNotRunOn, shouldRunOnlyOn, sleep, Uninitialized, 
    removeColumnNotIn, addColumnNotIn, passTest }