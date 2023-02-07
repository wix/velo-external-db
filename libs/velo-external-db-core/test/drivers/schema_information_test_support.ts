import { SystemFields } from '@wix-velo/velo-external-db-commons'
import { when } from 'jest-when'

export const schemaInformation = {
    schemaFieldsFor: jest.fn(),
    refresh: jest.fn(),
}

export const givenDefaultSchemaFor = (collectionName: any) => {
    when(schemaInformation.schemaFieldsFor).calledWith(collectionName)
                                           .mockResolvedValue( SystemFields.map(({ name, type, subtype }) => ({ field: name, type, subtype }) ) )
}

export const expectSchemaRefresh = () =>
    when(schemaInformation.refresh).mockResolvedValue(undefined)

export const givenSchemaFor = (collectionName: string, fields: {field: string, type: string, subtype?: string}[]) => {
    when(schemaInformation.schemaFieldsFor).calledWith(collectionName)
                                            .mockResolvedValue( fields.map(field => ({ field: field.field, type: 'string' })) )
}

export const givenSchemaFieldsResultFor = (dbs: any[]) =>
    dbs.forEach((db: { id: any; fields: any }) => when(schemaInformation.schemaFieldsFor).calledWith(db.id).mockResolvedValue(db.fields) )


export const reset = () => {
    schemaInformation.schemaFieldsFor.mockClear()
    schemaInformation.refresh.mockClear()
}
