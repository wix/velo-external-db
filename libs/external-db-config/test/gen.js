const Chance = require('chance')
const chance = Chance()

const randomConfig = () => ({
    host: chance.url(),
    user: chance.first(),
    password: chance.guid(),
    db: chance.word(),
})

module.exports = { randomConfig }