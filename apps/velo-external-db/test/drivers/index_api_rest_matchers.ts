import { IndexFieldOrder, IndexStatus, Index } from "libs/velo-external-db-core/src/spi-model/indexing";

const responseWith = (matcher: any) => expect.objectContaining({ data: matcher })


const indexWith = (index: Index, extraProps: Partial<Index>) => ({
    ...index,
    fields: index.fields.map(field => ({
        ...field,
        order: expect.toBeOneOf([IndexFieldOrder.ASC, IndexFieldOrder.DESC]),
    })),
    caseInsensitive: expect.any(Boolean), // TODO: remove this when we support case insensitive indexes
    ...extraProps
})


export const listIndexResponseWithDefaultIndex = () =>
    expect.arrayContaining([toHaveDefaultIndex()])

export const listIndexResponseWith = (indexes: Index[]) =>
    expect.arrayContaining(
        [...indexes.map((index: Index) => indexWith(index, { status: IndexStatus.ACTIVE }))]
    )

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


export const createIndexResponseWith = (index: Index) => responseWith(({ index: indexWith(index, { status: IndexStatus.BUILDING }) }))

export const removeIndexResponse = () => responseWith(({}))

export const listIndexResponseWithFailedIndex = (index: Index) => {
    return expect.arrayContaining([indexWith(index, { status: IndexStatus.FAILED })])
}
