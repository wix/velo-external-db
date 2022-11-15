import { EmptyFilter } from '../../src/converters/utils'
import { when } from 'jest-when'
import { AdapterOperators } from '@wix-velo/velo-external-db-commons'

export const filterTransformer = {
    transform: jest.fn(),
}

export const stubEmptyFilterFor = (filter: any) => {
    when(filterTransformer.transform).calledWith(filter)
        .mockReturnValue(EmptyFilter)
}

export const stubEmptyFilterForUndefined = () => {
    stubEmptyFilterFor(undefined)
}

export const givenFilterByIdWith = (id: any, filter: any) => {
    when(filterTransformer.transform).calledWith(filter)
                                .mockReturnValue({
                                    operator: AdapterOperators.eq,
                                    fieldName: '_id',
                                    value: id
                                })
}

export const givenTransformTo = (filter: any, transformedFilter: any) => {
    when(filterTransformer.transform).calledWith(filter)
                                .mockReturnValue(transformedFilter)
}

export const reset = () => {
    filterTransformer.transform.mockClear()
}

const transform = filterTransformer.transform
export { transform }
