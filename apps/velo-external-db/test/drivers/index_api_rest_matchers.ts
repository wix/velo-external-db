import { IndexFieldOrder, IndexStatus } from "libs/velo-external-db-core/src/spi-model/indexing";

// const responseWith = (matcher: any) => expect.objectContaining({ data: matcher })


export const listIndexResponseWithDefaultIndex = () =>
    expect.arrayContaining([toHaveDefaultIndex()])

// export const listIndexResponseWith = (indexes: any) =>
//     expect.arrayContaining(
//         [...indexes.map((index: any) => expect.objectContaining({
//             ...index,
//             status: IndexStatus.ACTIVE
//         }))]
//     )
export const listIndexResponseWith = (indexes: any) =>
    expect.arrayContaining(
        [...indexes.map((index: any) => ({
            ...index,
            status: IndexStatus.ACTIVE,
            caseInsensitive: expect.any(Boolean), // TODO: remove this when we support case insensitive indexes
        }))]
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


// [{"caseInsensitive": false, "fields": [{"order": "ASC", "path": "cebi"}], "name": "dak", "status": 2, "unique": true}]
// {"caseInsensitive": true, "fields": [{"order": "ASC", "path": "cebi"}], "name": "dak", "status": 2, "unique": true}]