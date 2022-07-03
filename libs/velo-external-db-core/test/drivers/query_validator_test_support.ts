import { SystemFields } from '@wix-velo/velo-external-db-commons'
import { when } from 'jest-when'

const systemFields = SystemFields.map(({ name, type, subtype }) => ({ field: name, type, subtype }) )

export const queryValidator = {
    validateFilter: jest.fn(),
    validateAggregation: jest.fn(),
    validateGetById: jest.fn(),
    validateProjection: jest.fn()
}

export const givenValidFilterForDefaultFieldsOf = (filter: any) => 
    when(queryValidator.validateFilter).calledWith(systemFields, filter)
                                       .mockReturnValue(undefined)


export const givenValidAggregationForDefaultFieldsOf = (aggregation: any) => 
    when(queryValidator.validateAggregation).calledWith(systemFields, aggregation)
                                            .mockResolvedValue(undefined)

export const givenValidGetByIdForDefaultFieldsFor = (itemId: any) => 
    when(queryValidator.validateGetById).calledWith(systemFields, itemId)
                                       .mockReturnValue(undefined)

export const givenValidProjectionForDefaultFieldsOf = (projection: any) =>
    when(queryValidator.validateProjection).calledWith(systemFields, projection)
                                           .mockReturnValue(undefined)

export const reset = () => {
    queryValidator.validateFilter.mockClear()
    queryValidator.validateAggregation.mockClear()
    queryValidator.validateGetById.mockClear()
    queryValidator.validateProjection.mockClear()
}

const validateFilter = queryValidator.validateFilter
export { validateFilter }
