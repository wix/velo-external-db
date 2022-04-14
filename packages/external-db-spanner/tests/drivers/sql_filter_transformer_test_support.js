const { EmptySort } = require('velo-external-db-commons')
const { when } = require('jest-when')
const { escapeId, escapeFieldId, validateLiteral } = require('../../lib/spanner_utils')

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
                                .mockReturnValue({ filterExpr: '', parameters: [] })
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
                              .mockReturnValue({ sortExpr: `ORDER BY ${escapeFieldId(column)} ASC` })
}


const givenFilterByIdWith = (id, filter) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE ${escapeFieldId('_id')} = @_id`, parameters: { _id: id } })
}

const givenAggregateQueryWith = (having, numericColumns, columnAliases, groupByColumns, filter) => {
    const c = numericColumns.map(c => c.name)
    when(filterParser.parseAggregation).calledWith({ postFilteringStep: filter, processingStep: having })
                                       .mockReturnValue({
                                           fieldsStatement: `${groupByColumns.map( patchFieldName ).map( escapeId )}, MAX(${escapeFieldId(c[0])}) AS ${escapeId(columnAliases[0])}, SUM(${escapeId(c[1])}) AS ${escapeId(columnAliases[1])}`,
                                           groupByColumns: groupByColumns.map( patchFieldName ),
                                           havingFilter: '',
                                           parameters: {},
                                       })
}

const givenAllFieldsProjectionFor = (projection) => 
    when(filterParser.selectFieldsFor).calledWith(projection)
                                      .mockReturnValue('*')

const givenProjectionExprFor = (projection) => 
    when(filterParser.selectFieldsFor).calledWith(projection)
                                      .mockReturnValue(projection.map(escapeFieldId).join(', '))

const givenStartsWithFilterFor = (filter, column, value) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE LOWER(${escapeFieldId(column)}) LIKE LOWER(${validateLiteral(column)})`, parameters: { [column]: `${value}%` } })

const givenGreaterThenFilterFor = (filter, column, value) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE ${escapeFieldId(column)} > ${validateLiteral(column)}`, parameters: { [column]: value } })

const givenNotFilterQueryFor = (filter, column, value) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE NOT ${escapeFieldId(column)} = ${validateLiteral(column)}`, parameters: { [column]: value } })

const reset = () => {
    filterParser.transform.mockClear()
    filterParser.orderBy.mockClear()
    filterParser.parseAggregation.mockClear()
    filterParser.parseFilter.mockClear()
    filterParser.selectFieldsFor.mockClear()
}

module.exports = { stubEmptyFilterAndSortFor, givenOrderByFor, stubEmptyOrderByFor,
                   stubEmptyFilterFor, givenFilterByIdWith, givenAggregateQueryWith,
                    givenAllFieldsProjectionFor, givenProjectionExprFor, givenStartsWithFilterFor,
                    givenGreaterThenFilterFor, givenNotFilterQueryFor,
                   filterParser, reset
}