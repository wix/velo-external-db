import { when } from 'jest-when'
import { AdapterOperators } from '@wix-velo/velo-external-db-commons'
const { eq } = AdapterOperators

export const filterParser = {
    projection: jest.fn(),
    filter: jest.fn(),
}


export const stubEmptyFilterFor = (_filter: any) => {    
}


export const stubEmptyOrderByFor = (projection: any) => {    
    when(filterParser.projection).calledWith(projection).mockReturnValue([])    
}

export const givenProjectionExprFor = (projection: any) => {  
    when(filterParser.projection).calledWith(projection).mockReturnValue([projection])    
}

export const givenAllFieldsProjectionFor = (projection: any) => { 
    when(filterParser.projection).calledWith(projection).mockReturnValue(undefined)        
}

export const stubEmptyFilterAndSortFor = (_filter: any) => {    
}

export const givenFilterByIdWith = (id:any, filter: any) => {
    when(filterParser.filter).calledWith(filter).mockReturnValue({ operator: eq, fieldName: '_id', value: id }) 
        
}


export const reset = () => {
    filterParser.projection.mockClear()
    filterParser.filter.mockClear()
}
