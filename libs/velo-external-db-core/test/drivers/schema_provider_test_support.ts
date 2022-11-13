import { when } from 'jest-when'
import { AllSchemaOperations } from '@wix-velo/velo-external-db-commons'

export const schemaProvider = {
    list: jest.fn(),
    listHeaders: jest.fn(),
    describeCollection: jest.fn(),
    create: jest.fn(),
    addColumn: jest.fn(),
    removeColumn: jest.fn(),
    supportedOperations: jest.fn(),
    getColumnCapabilitiesFor: jest.fn(),
}

export const givenListResult = (dbs: any) =>
    when(schemaProvider.list).mockResolvedValue(dbs)

export const givenListHeadersResult = (collections: any) =>
    when(schemaProvider.listHeaders).mockResolvedValue(collections)

export const givenAdapterSupportedOperationsWith = (operations: any) =>
    when(schemaProvider.supportedOperations).mockReturnValue(operations)

export const givenAllSchemaOperations = () =>
    when(schemaProvider.supportedOperations).mockReturnValue(AllSchemaOperations)

export const givenFindResults = (dbs: any[]) =>
    dbs.forEach((db: { id: any; fields: any }) => when(schemaProvider.describeCollection).calledWith(db.id).mockResolvedValue(db.fields) )

export const expectCreateOf = (collectionName: any) =>
    when(schemaProvider.create).calledWith(collectionName)
                               .mockResolvedValue(undefined)

export const expectCreateColumnOf = (column: any, collectionName: any) =>
    when(schemaProvider.addColumn).calledWith(collectionName, column)
                                  .mockResolvedValue(undefined)

export const expectRemoveColumnOf = (columnName: any, collectionName: any) =>
    when(schemaProvider.removeColumn).calledWith(collectionName, columnName)
                                     .mockResolvedValue(undefined)

export const givenColumnCapabilities = () => {
    when(schemaProvider.getColumnCapabilitiesFor).calledWith('text')
        .mockReturnValue({ sortable: true, columnQueryOperators: ['eq', 'ne', 'contains', 'startsWith', 'endsWith', 'hasSome', 'gt', 'gte', 'lt', 'lte'] })
    when(schemaProvider.getColumnCapabilitiesFor).calledWith('number')
        .mockReturnValue({ sortable: true, columnQueryOperators: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'hasSome'] })
    when(schemaProvider.getColumnCapabilitiesFor).calledWith('boolean')
        .mockReturnValue({ sortable: true, columnQueryOperators: ['eq'] })
    when(schemaProvider.getColumnCapabilitiesFor).calledWith('url')
        .mockReturnValue({ sortable: true, columnQueryOperators: ['eq', 'ne', 'contains', 'hasSome'] })
    when(schemaProvider.getColumnCapabilitiesFor).calledWith('datetime')
        .mockReturnValue({ sortable: true, columnQueryOperators: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'] })
    when(schemaProvider.getColumnCapabilitiesFor).calledWith('image')
        .mockReturnValue({ sortable: false, columnQueryOperators: [] })
    when(schemaProvider.getColumnCapabilitiesFor).calledWith('object')
        .mockReturnValue({ sortable: false, columnQueryOperators: ['eq', 'ne'] })
}
    

export const reset = () => {
    schemaProvider.list.mockClear()
    schemaProvider.listHeaders.mockClear()
    schemaProvider.describeCollection.mockClear()
    schemaProvider.create.mockClear()
    schemaProvider.addColumn.mockClear()
    schemaProvider.removeColumn.mockClear()
    schemaProvider.supportedOperations.mockClear()
    schemaProvider.getColumnCapabilitiesFor.mockClear()
}
