const { SystemFields } = require('velo-external-db-commons')
const { when } = require('jest-when')

const systemFields = SystemFields.map(({ name, type, subtype }) => ({ field: name, type, subtype }) )

const queryValidator = {
    validateFilter: jest.fn(),
    validateAggregation: jest.fn(),
    validateGetById: jest.fn()
}

const givenValidFilterForDefaultFieldsOf = (filter) => 
    when(queryValidator.validateFilter).calledWith(systemFields, filter)
                                       .mockReturnValue()


const givenValidAggregationForDefaultFieldsOf = (aggregation) => 
    when(queryValidator.validateAggregation).calledWith(systemFields, aggregation)
                                            .mockResolvedValue()

const givenValidGetByIdForDefaultFieldsFor = (itemId) => 
    when(queryValidator.validateGetById).calledWith(systemFields, itemId)
                                       .mockReturnValue()

const reset = () => {
    queryValidator.validateFilter.mockClear()
}

module.exports = {
    queryValidator, givenValidFilterForDefaultFieldsOf, reset, validateFilter: queryValidator.validateFilter,
     givenValidAggregationForDefaultFieldsOf, givenValidGetByIdForDefaultFieldsFor
}