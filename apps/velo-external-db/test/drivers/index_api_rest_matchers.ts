import { indexSpi } from '@wix-velo/velo-external-db-core'
const { IndexFieldOrder, IndexStatus } = indexSpi

const indexWith = (index: indexSpi.Index, extraProps: Partial<indexSpi.Index>) => ({
    ...index,
    fields: index.fields.map(field => ({
        ...field,
        order: expect.toBeOneOf([IndexFieldOrder.ASC, IndexFieldOrder.DESC]),
    })),
    caseInsensitive: expect.any(Boolean), // TODO: remove this when we support case insensitive indexes
    ...extraProps
})

export const failedIndexCreationResponse = (index: indexSpi.Index) => ({
    index: indexWith(index, { status: IndexStatus.FAILED }) 
})


export const listIndexResponseWithDefaultIndex = () => ({
    indexes: expect.arrayContaining([toHaveDefaultIndex()])
})

export const listIndexResponseWith = (indexes: indexSpi.Index[]) => ({
    indexes: expect.arrayContaining(
        [...indexes.map((index: indexSpi.Index) => indexWith(index, { status: IndexStatus.ACTIVE }))]
    )
})

export const toHaveDefaultIndex = () => ({
    name: expect.any(String),
    fields: expect.arrayContaining([
        expect.objectContaining({
            path: '_id',
            order: expect.toBeOneOf([IndexFieldOrder.ASC, IndexFieldOrder.DESC])
        })
    ]),
    caseInsensitive: expect.any(Boolean),
    status: IndexStatus.ACTIVE,
    unique: true
})


export const createIndexResponseWith = (index: indexSpi.Index) => ({ index: indexWith(index, { status: IndexStatus.BUILDING }) })

export const removeIndexResponse = () => (({}))

export const listIndexResponseWithFailedIndex = (index: indexSpi.Index) => {
    return expect.arrayContaining([indexWith(index, { status: IndexStatus.FAILED })])
}
