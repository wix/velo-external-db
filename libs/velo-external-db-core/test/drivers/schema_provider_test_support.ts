import { when } from 'jest-when'
import { AllSchemaOperations, AdapterOperators } from '@wix-velo/velo-external-db-commons'
import { Table } from '@wix-velo/velo-external-db-types'
const { eq, ne, string_contains, string_begins, string_ends, gt, gte, lt, lte, include } = AdapterOperators

export const schemaProvider = {
    list: jest.fn(),
    listHeaders: jest.fn(),
    describeCollection: jest.fn(),
    create: jest.fn(),
    addColumn: jest.fn(),
    removeColumn: jest.fn(),
    supportedOperations: jest.fn(),
    columnCapabilitiesFor: jest.fn(),
    changeColumnType: jest.fn(),
}

export const givenListResult = (dbs: any) =>
    when(schemaProvider.list).mockResolvedValue(dbs)

export const givenListHeadersResult = (collections: any) =>
    when(schemaProvider.listHeaders).mockResolvedValue(collections)

export const givenAdapterSupportedOperationsWith = (operations: any) =>
    when(schemaProvider.supportedOperations).mockReturnValue(operations)

export const givenAllSchemaOperations = () =>
    when(schemaProvider.supportedOperations).mockReturnValue(AllSchemaOperations)

export const givenFindResults = (tables: Table[]) =>
    tables.forEach((table) => when(schemaProvider.describeCollection).calledWith(table.id).mockResolvedValue({ id: table.id, fields: table.fields, capabilities: table.capabilities }))

export const expectCreateOf = (collectionName: any) =>
    when(schemaProvider.create).calledWith(collectionName)
                               .mockResolvedValue(undefined)

export const expectCreateWithFieldsOf = (collectionName: any, column: any) =>
    when(schemaProvider.create).calledWith(collectionName, column)
                               .mockResolvedValue(undefined)

export const expectCreateColumnOf = (column: any, collectionName: any) =>
    when(schemaProvider.addColumn).calledWith(collectionName, column)
                                  .mockResolvedValue(undefined)

export const expectRemoveColumnOf = (columnName: any, collectionName: any) =>
    when(schemaProvider.removeColumn).calledWith(collectionName, columnName)
                                     .mockResolvedValue(undefined)

export const givenColumnCapabilities = () => {
    when(schemaProvider.columnCapabilitiesFor).calledWith('text')
        .mockReturnValue({ sortable: true, columnQueryOperators: [eq, ne, string_contains, string_begins, string_ends, include, gt, gte, lt, lte] })
    when(schemaProvider.columnCapabilitiesFor).calledWith('number')
        .mockReturnValue({ sortable: true, columnQueryOperators: [eq, ne, gt, gte, lt, lte, include] })
    when(schemaProvider.columnCapabilitiesFor).calledWith('boolean')
        .mockReturnValue({ sortable: true, columnQueryOperators: [eq] })
    when(schemaProvider.columnCapabilitiesFor).calledWith('url')
        .mockReturnValue({ sortable: true, columnQueryOperators: [eq, ne, string_contains, string_begins, string_ends, include, gt, gte, lt, lte] })
    when(schemaProvider.columnCapabilitiesFor).calledWith('datetime')
        .mockReturnValue({ sortable: true, columnQueryOperators: [eq, ne, gt, gte, lt, lte] })
    when(schemaProvider.columnCapabilitiesFor).calledWith('image')
        .mockReturnValue({ sortable: false, columnQueryOperators: [] })
    when(schemaProvider.columnCapabilitiesFor).calledWith('object')
        .mockReturnValue({ sortable: false, columnQueryOperators: [eq, ne] })
}
    

export const reset = () => {
    schemaProvider.list.mockClear()
    schemaProvider.listHeaders.mockClear()
    schemaProvider.describeCollection.mockClear()
    schemaProvider.create.mockClear()
    schemaProvider.addColumn.mockClear()
    schemaProvider.removeColumn.mockClear()
    schemaProvider.supportedOperations.mockClear()
    schemaProvider.columnCapabilitiesFor.mockClear()
    schemaProvider.changeColumnType.mockClear()
}
