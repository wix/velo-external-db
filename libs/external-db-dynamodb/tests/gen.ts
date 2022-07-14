

import * as Chance from 'chance' 
import { AdapterOperators } from '@wix-velo/velo-external-db-commons'
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_ends, string_contains } = AdapterOperators 

const chance = Chance()

const operatorsWithoutEqual = [lt, lte, gt, gte, include, string_contains, string_begins, string_ends]
const randomOperatorWithoutEqual = () => ( chance.pickone(operatorsWithoutEqual) )
const randomAdapterOperator = () => ( chance.pickone([...operatorsWithoutEqual, eq]) )


export const idFilter = ({withoutEqual}: {withoutEqual: boolean} = {withoutEqual: false}) => {
    const operator = withoutEqual ? randomOperatorWithoutEqual() : randomAdapterOperator() 
    const value = operator === '$hasSome' ? [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()] : chance.word()
    return {
        fieldName: '_id',
        operator,
        value
    }
}
