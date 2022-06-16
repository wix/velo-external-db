import Chance = require('chance')
const chance = Chance()

export const validConfig = () => ({
    host: chance.word(),
    password: chance.word(),
    db: chance.word(),
    user: chance.word() 
})

export const validGCPConfig = () => ({
    cloudSqlConnectionName: chance.word(),
    password: chance.word(),
    db: chance.word(),
    user: chance.word() 
})

export const configWithInvalidHost = () => ({
    ... validConfig(),
    host: chance.natural()
})
