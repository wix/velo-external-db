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
    externalDatabaseId: chance.guid(),
    allowedMetasites: chance.guid(),
})

export const randomExtendedCommonConfig = () => ({
    externalDatabaseId: chance.guid(),
    allowedMetasites: chance.guid(),
    vendor: chance.pickone(supportedVendors),
    type: chance.pickone(supportedDBs),
})
