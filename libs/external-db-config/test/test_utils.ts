
import * as Chance from 'chance'
import { gen } from '@wix-velo/test-commons'

const chance = new Chance()
const { randomElementsFromArray } = gen

export const validAuthorizationConfig = {
    collectionPermissions: [
        {
            id: chance.word(),
            read: ['Admin'],
            write: ['Admin'],
        }
    ]
}

export const splitConfig = (config: {[key: string]: any}) => {
    const firstPart = randomElementsFromArray(Object.keys(config)).reduce((pV, cV) => ({ ...pV, [cV]: config[cV] }), {})
    
    const secondPart = Object.keys(config).filter(k => firstPart[k] === undefined)
                                          .reduce((pV, cV) => ({ ...pV, [cV]: config[cV] }), {})
    return { firstPart, secondPart }
}

export const extendedCommonConfigRequiredProperties = ['jwtPublicKey', 'appDefId', 'vendor', 'type']
