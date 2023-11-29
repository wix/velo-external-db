import { SystemFields } from '@wix-velo/velo-external-db-commons'
import { ResponseField, DataOperation, PagingMode } from '@wix-velo/velo-external-db-types'
import { when } from 'jest-when'

export const schemaInformation = {
    schemaFieldsFor: jest.fn(),
    schemaFor: jest.fn(),
    refresh: jest.fn(),
}

export const givenDefaultSchemaFor = (collectionName: any) => {
    when(schemaInformation.schemaFieldsFor).calledWith(collectionName)
                                           .mockResolvedValue( SystemFields.map(({ name, type, subtype }) => ({ field: name, type, subtype }) ) )
}

export const expectSchemaRefresh = () =>
    when(schemaInformation.refresh).mockResolvedValue(undefined)

export const givenSchemaFieldsFor = (collectionName: string, fields: {field: string, type: string, subtype?: string}[]) => {
    when(schemaInformation.schemaFieldsFor).calledWith(collectionName)
                                            .mockResolvedValue( fields.map(field => ({ field: field.field, type: 'string' })) )
}

export const givenSchemaFor = (collectionName: string, fields: ResponseField[], capabilities: any) => {
    when(schemaInformation.schemaFor).calledWith(collectionName)
                                           .mockResolvedValue({ id: collectionName, fields, capabilities })
}

export const givenReadWriteOperationsCapabilitiesFor = (collectionName: string, fields: ResponseField[]) => {
    const readWriteCapabilities = Object.values(DataOperation)
    givenCapabilitiesFor(collectionName, fields, readWriteCapabilities)
}

export const givenReadOnlyOperationsCapabilitiesFor = (collectionName: string, fields: ResponseField[]) => {
    const { query, count, queryReferenced, aggregate, } = DataOperation
    const ReadOnlyCapabilities = [query, count, queryReferenced, aggregate]
    givenCapabilitiesFor(collectionName, fields, ReadOnlyCapabilities)
}

export const givenCapabilitiesFor = (collectionName: string, fields: ResponseField[], dataCapabilities: any) => {
    const capabilities = {
        dataOperations: dataCapabilities,
        pagingMode: PagingMode.offset
    }
    when(schemaInformation.schemaFor).calledWith(collectionName)
                                     .mockResolvedValue({ id: collectionName, fields, capabilities })
}

export const givenSchemaFieldsResultFor = (dbs: any[]) =>
    dbs.forEach((db: { id: any; fields: any }) => when(schemaInformation.schemaFieldsFor).calledWith(db.id).mockResolvedValue(db.fields) )


export const reset = () => {
    schemaInformation.schemaFieldsFor.mockClear()
    schemaInformation.schemaFor.mockClear()
    schemaInformation.refresh.mockClear()
}
