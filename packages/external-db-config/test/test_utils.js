
const Chance = require('chance')
const chance = new Chance()

const validAuthorizationConfig = {
    collectionLevelConfig: [
        {
            id: chance.word(),
            readPolicies: ['Admin'],
            writePolicies: ['Admin'],
        }
    ]
}

module.exports = { validAuthorizationConfig }