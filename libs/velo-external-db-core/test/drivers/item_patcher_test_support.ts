import { when } from 'jest-when'
import { SystemFields } from '@wix-velo/velo-external-db-commons'

export const itemTransformer = {
    prepareItemsForInsert: jest.fn(),
    patchItems: jest.fn()
}

const systemFields = SystemFields.map(({ name, type, subtype }) => ({ field: name, type, subtype }) )

export const givenPreparedItemsForInsertWith = (prepared: any, items: any) => 
    when(itemTransformer.prepareItemsForInsert).calledWith(items, systemFields)
                                           .mockReturnValue(prepared)


export const givenPatchedBooleanFieldsWith = (patched: any, items: any, fields?: { field: string, type: string, subtype?: string }[]) =>
    when(itemTransformer.patchItems).calledWith(items, fields || systemFields)
                                      .mockReturnValue(patched)

export const reset = () => {
    itemTransformer.prepareItemsForInsert.mockClear()
    itemTransformer.patchItems.mockClear()
}

