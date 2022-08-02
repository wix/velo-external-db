import { EmptySort } from '@wix-velo/velo-external-db-commons'
import { when } from 'jest-when'

export const filterParser = {
    transform: jest.fn(),
    parseFilter: jest.fn(),
    orderBy: jest.fn(),
    parseAggregation: jest.fn(),
    selectFieldsFor: jest.fn()
}

export const stubEmptyFilterAndSortFor = (filter: any, sort: any) => {
    stubEmptyFilterFor(filter)
    stubEmptyOrderByFor(sort)
}

export const stubEmptyFilterFor = (filter: any) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: '', parameters: [] })
}

export const stubEmptyOrderByFor = (sort: any) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue(EmptySort)
}

export const givenOrderByFor = (column: any, sort: any) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue({  sort: [ { field: column, direction: 'asc' } ] })

}


export const givenFilterByIdWith = (id: any, filter: any) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `_id = "${id}"` })
}

export const givenAllFieldsProjectionFor = (projection: any) =>
    when(filterParser.selectFieldsFor).calledWith(projection)
                                      //@ts-ignore 
                                      .mockReturnValue()

export const givenProjectionExprFor = (projection: any) => 
    when(filterParser.selectFieldsFor).calledWith(projection)
                                      .mockReturnValue(projection)




export const reset = () => {
    filterParser.transform.mockClear()
    filterParser.orderBy.mockClear()
    filterParser.parseAggregation.mockClear()
    filterParser.parseFilter.mockClear()
    filterParser.selectFieldsFor.mockClear()
}
