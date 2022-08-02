import { when } from 'jest-when'

export const bigQueryItem: any = {}

export const givenNullValueTo = ( propertyName: string ) => bigQueryItem[propertyName] = null


export const givenNumberValueTo = (propertyName: string, number: number) => {
    bigQueryItem[propertyName] = { toNumber: jest.fn() }
    when(bigQueryItem[propertyName].toNumber).calledWith().mockReturnValue(number)
}

export const givenDateValueTo = (propertyName: string, date: Date) => {
    bigQueryItem[propertyName] = { value: date.toISOString() }
}

export const givenWrongFormatDateValueTo = (propertyName: string, date: Date) => {
    bigQueryItem[propertyName] = date.toISOString()
}
export const reset = () => {
    Object.keys(bigQueryItem).forEach(key => delete bigQueryItem[key])
}
