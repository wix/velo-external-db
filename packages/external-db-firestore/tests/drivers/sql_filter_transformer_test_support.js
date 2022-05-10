const { when } = require('jest-when')
const { LastLetterCoder } = require('../../lib/firestore_utils')
const escapeId = x => x

const EmptySort = []

const filterParser = {
    transform: jest.fn(),
    parseFilter: jest.fn(),
    orderBy: jest.fn(),
    parseAggregation: jest.fn(),
    selectFieldsFor: jest.fn(),
}

const stubEmptyFilterAndSortFor = (filter, sort) => {
    stubEmptyFilterFor(filter)
    stubEmptyOrderByFor(sort)
}

const stubEmptyFilterFor = (filter) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue(EmptySort)
}

const stubEmptyOrderByFor = (sort) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue(EmptySort)
}

const patchFieldName = (f) => {
    if (f.startsWith('_')) {
        return `x${f}`
    }
    return f
}

const givenOrderByFor = (column, sort) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue([{ fieldName: column, direction: 'asc' }])
}

const givenFilterByIdWith = (id, filter) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue([{ fieldName: '_id', opStr: '==', value: id }])
}

const givenAggregateQueryWith = (having, numericColumns, columnAliases, groupByColumns, filter) => {
    const c = numericColumns.map(c => c.name)
    when(filterParser.parseAggregation).calledWith(having, filter)
                                       .mockReturnValue({
                                           fieldsStatement: `${groupByColumns.map( patchFieldName ).map( escapeId )}, MAX(${escapeId(patchFieldName(c[0]))}) AS ${escapeId(columnAliases[0])}, SUM(${escapeId(c[1])}) AS ${escapeId(columnAliases[1])}`,
                                           groupByColumns: groupByColumns.map( patchFieldName ),
                                           havingFilter: '',
                                           parameters: {},
                                       })
}

const givenAllFieldsProjectionFor = (projection) => 
    when(filterParser.selectFieldsFor).calledWith(projection)
                                      .mockReturnValue()

const givenProjectionExprFor = (projection) => 
    when(filterParser.selectFieldsFor).calledWith(projection)
                                      .mockReturnValue(projection)


const givenStartsWithFilterFor = (filter, column, value) => 
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue([{
                                    fieldName: column,
                                    opStr: '>=',
                                    value,
                                },
                                {
                                    fieldName: column,
                                    opStr: '<',
                                    value: value + LastLetterCoder
                                }])

const givenGreaterThenFilterFor = (filter, column, value) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue([{
                                    fieldName: column,
                                    opStr: '>',
                                    value,
                                }])

const givenIncludeFilterForIdColumn = (filter, value) => 
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue([{
                                    fieldName: '_id',
                                    opStr: 'in',
                                    value: [value],
                                }])

const reset = () => {
    filterParser.transform.mockClear()
    filterParser.orderBy.mockClear()
    filterParser.parseAggregation.mockClear()
    filterParser.parseFilter.mockClear()
    filterParser.selectFieldsFor.mockClear()
}

module.exports = { stubEmptyFilterAndSortFor, givenOrderByFor, stubEmptyOrderByFor,
                   stubEmptyFilterFor, givenFilterByIdWith, givenAggregateQueryWith,
                   givenAllFieldsProjectionFor, givenProjectionExprFor, givenStartsWithFilterFor, givenGreaterThenFilterFor, givenIncludeFilterForIdColumn,
                   filterParser, reset
                }