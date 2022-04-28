const Chance = require('chance')
const chance = Chance()

const validConfig = () => ({
    host: chance.word(),
    password: chance.word(),
    db: chance.word(),
    user: chance.word() 
})

const validGCPConfig = () => ({
    cloudSqlConnectionName: chance.word(),
    password: chance.word(),
    db: chance.word(),
    user: chance.word() 
})

const configWithInvalidHost = () => ({
    ... validConfig(),
    host: chance.natural()
})

module.exports = { validConfig, validGCPConfig, configWithInvalidHost }