import * as Chance from 'chance'
import { AdapterOperators } from '@wix-velo/velo-external-db-commons'
const chance = Chance()
const { eq, gt, gte, include, lt, lte, ne } = AdapterOperators

export const randomSupportedFilter = () => {
    const operator = chance.pickone([ne, lt, lte, gt, gte, include, eq])
    const fieldName = chance.word()
    const value = operator === include ? [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()] : chance.word()
    return {
        fieldName,
        operator,
        value
    }
}
