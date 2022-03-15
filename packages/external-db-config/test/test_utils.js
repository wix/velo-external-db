
const Chance = require('chance')
const chance = new Chance()
const { randomElementsFromArray } = require ('test-commons').gen
const validAuthorizationConfig = {
    collectionLevelConfig: [
        {
            id: chance.word(),
            readPolicies: ['Admin'],
            writePolicies: ['Admin'],
        }
    ]
}

const splitConfig = (config) => {
    const firstPart = randomElementsFromArray(Object.keys(config)).reduce((pV, cV) => ({ ...pV, [cV]: config[cV] }), {})
    
    const secondPart = Object.keys(config).filter(k => firstPart[k] === undefined)
                                          .reduce((pV, cV) => ({ ...pV, [cV]: config[cV] }), {})
    return { firstPart, secondPart }
}
module.exports = { validAuthorizationConfig, splitConfig }