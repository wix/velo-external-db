import * as Chance from 'chance'
import { supportedVendors, supportedDBs } from '../src/utils/config_utils'
const chance = Chance()

export const randomConfig = () => ({
    host: chance.url(),
    user: chance.first(),
    password: chance.guid(),
    db: chance.word(),
})

export const randomCommonConfig = () => ({
    secretKey: chance.guid(),
})

export const randomExtendedCommonConfig = () => ({
    secretKey: chance.guid(),
    vendor: chance.pickone(supportedVendors),
    type: chance.pickone(supportedDBs),
})
