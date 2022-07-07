
const Chance = require('chance')
const chance = new Chance()
const { randomElementsFromArray } = require ('@wix-velo/test-commons').gen
const validAuthorizationConfig = {
    collectionPermissions: [
        {
            id: chance.word(),
            read: ['Admin'],
            write: ['Admin'],
        }
    ]
}

const splitConfig = (config) => {
    const firstPart = randomElementsFromArray(Object.keys(config)).reduce((pV, cV) => ({ ...pV, [cV]: config[cV] }), {})
    
    const secondPart = Object.keys(config).filter(k => firstPart[k] === undefined)
                                          .reduce((pV, cV) => ({ ...pV, [cV]: config[cV] }), {})
    return { firstPart, secondPart }
}

const extendedCommonConfigRequiredProperties = ['secretKey', 'vendor', 'type']

module.exports = { validAuthorizationConfig, splitConfig, extendedCommonConfigRequiredProperties }