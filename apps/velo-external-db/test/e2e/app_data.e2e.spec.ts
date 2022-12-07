import { Uninitialized, gen as genCommon } from '@wix-velo/test-commons'
import { SchemaOperations } from '@wix-velo/velo-external-db-types'
import { dataSpi } from '@wix-velo/velo-external-db-core'
const { UpdateImmediately, DeleteImmediately, Truncate, Aggregate, FindWithSort, Projection } = SchemaOperations
import { testIfSupportedOperationsIncludes } from '@wix-velo/test-commons'
import * as gen from '../gen'
import * as schema from '../drivers/schema_api_rest_test_support'
import * as matchers from '../drivers/schema_api_rest_matchers'
import { authAdmin, authOwner, authVisitor } from '@wix-velo/external-db-testkit'
import * as authorization from '../drivers/authorization_test_support'
import Chance = require('chance')
import { initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName, supportedOperations } from '../resources/e2e_resources'


import axios from 'axios'
import { streamToArray } from '@wix-velo/test-commons'

const chance = Chance()


const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080'
})

const queryRequest = (collectionName, sort, fields, filter?: any) => ({ 
    collectionId: collectionName,
    query: {
        filter: filter ? filter : '',
        sort: sort,
        fields: fields,
        fieldsets: undefined,
        paging: {
            limit: 25,
            offset: 0,
        },
        cursorPaging: null
    } as dataSpi.QueryV2,
    includeReferencedItems: [],
    options: {
        consistentRead: false,
        appOptions: {},
    } as dataSpi.Options,
    omitTotalCount: false
} as dataSpi.QueryRequest)



const queryCollectionAsArray = (collectionName, sort, fields, filter?: any) => axiosInstance.post('/data/query', 
            queryRequest(collectionName, sort, fields, filter), 
            { responseType: 'stream', transformRequest: authVisitor.transformRequest }).then(response => streamToArray(response.data))

const countRequest = (collectionName) => ({
    collectionId: collectionName,
    filter: '',
    options: {
        consistentRead: false,
        appOptions: {},
    } as dataSpi.Options,
}) as dataSpi.CountRequest  

const updateRequest = (collectionName, items) => ({
    // collection name
    collectionId: collectionName,
    // Optional namespace assigned to collection/installation
   // Items to update, must include _id
   items: items,
   // request options
   options: {
        consistentRead: false,
        appOptions: {},
    } as dataSpi.Options,
}) as dataSpi.UpdateRequest

const insertRequest = (collectionName, items, overwriteExisting) => ({
    collectionId: collectionName,
    items: items,
    overwriteExisting: overwriteExisting,
    options: {
        consistentRead: false,
        appOptions: {},
    } as dataSpi.Options,
} as dataSpi.InsertRequest)

const givenItems = async(items, collectionName, auth) => 
    axiosInstance.post('/data/insert', insertRequest(collectionName, items, false),  { responseType: 'stream', transformRequest: auth.transformRequest })

const pagingMetadata = (total, count) => ({ pagingMetadata: { count: count, offset: 0, total: total, tooManyToCount: false } } as dataSpi.QueryResponsePart)

describe(`Velo External DB Data REST API: ${currentDbImplementationName()}`,  () => {
    beforeAll(async() => {
        await setupDb()
        await initApp()
    }, 20000)

    afterAll(async() => {
        await dbTeardown()
    }, 20000)

    testIfSupportedOperationsIncludes(supportedOperations, [ FindWithSort ])('find api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await givenItems([ctx.item, ctx.anotherItem], ctx.collectionName, authAdmin)
        await authorization.givenCollectionWithVisitorReadPolicy(ctx.collectionName)

        const itemsByOrder = [ctx.item, ctx.anotherItem].sort((a, b) => (a[ctx.column.name] > b[ctx.column.name]) ? 1 : -1).map(item => ({ item }))
        
        await expect(queryCollectionAsArray(ctx.collectionName, [{ fieldName: ctx.column.name, order: 'ASC' }], undefined)).resolves.toEqual(
            ([...itemsByOrder, pagingMetadata(2, 2)])
        )
    })
    
    testIfSupportedOperationsIncludes(supportedOperations, [ Projection ])('find api with projection', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await givenItems([ctx.item ], ctx.collectionName, authAdmin)
       
        await expect(queryCollectionAsArray(ctx.collectionName, [], [ctx.column.name])).resolves.toEqual(
            expect.arrayContaining([{ item: { [ctx.column.name]: ctx.item[ctx.column.name] } }, pagingMetadata(1, 1)])
        )                
    })
    
    //todo: create another test without sort for these implementations

    test('insert api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)

        const response = await axiosInstance.post('/data/insert', insertRequest(ctx.collectionName, ctx.items, false),  { responseType: 'stream', transformRequest: authAdmin.transformRequest })

        const expectedItems = ctx.items.map(item => ({ item: item } as dataSpi.QueryResponsePart))

        await expect(streamToArray(response.data)).resolves.toEqual(expectedItems)
        await expect(queryCollectionAsArray(ctx.collectionName, [], undefined)).resolves.toEqual(expect.arrayContaining(
            [ 
                ...expectedItems, 
                pagingMetadata(ctx.items.length, ctx.items.length)
            ])
        )
    })

    test('insert api should fail if item already exists', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await givenItems([ ctx.items[0] ], ctx.collectionName, authAdmin)

        const response = axiosInstance.post('/data/insert', insertRequest(ctx.collectionName, ctx.items, false),  { responseType: 'stream', transformRequest: authAdmin.transformRequest })

        const expectedItems = [dataSpi.QueryResponsePart.item(ctx.items[0])]

        await expect(response).rejects.toThrow('400')

        await expect(queryCollectionAsArray(ctx.collectionName, [], undefined)).resolves.toEqual(expect.arrayContaining(
            [ 
                ...expectedItems, 
                pagingMetadata(expectedItems.length, expectedItems.length)
            ])
        )
    })

    test('insert api should succeed if item already exists and overwriteExisting is on', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await givenItems([ ctx.item ], ctx.collectionName, authAdmin)

        const response = await axiosInstance.post('/data/insert', insertRequest(ctx.collectionName, [ctx.modifiedItem], true),  { responseType: 'stream', transformRequest: authAdmin.transformRequest })
        const expectedItems = [dataSpi.QueryResponsePart.item(ctx.modifiedItem)]

        await expect(streamToArray(response.data)).resolves.toEqual(expectedItems)
        await expect(queryCollectionAsArray(ctx.collectionName, [], undefined)).resolves.toEqual(expect.arrayContaining(
            [ 
                ...expectedItems, 
                pagingMetadata(expectedItems.length, expectedItems.length)
            ])
        )
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ Aggregate ])('aggregate api', async() => {
        
        await schema.givenCollection(ctx.collectionName, ctx.numberColumns, authOwner)
        await givenItems([ctx.numberItem, ctx.anotherNumberItem], ctx.collectionName, authAdmin)
        const response = await axiosInstance.post('/data/aggregate',
        {
            collectionId: ctx.collectionName,
            initialFilter: { _id: { $eq: ctx.numberItem._id } },
            group: {
                by: ['_id', '_owner'], aggregation: [
                    {
                        name: 'myAvg',
                        avg: ctx.numberColumns[0].name
                    },
                    {
                        name: 'mySum',
                        sum: ctx.numberColumns[1].name
                    }
                ]
            } as dataSpi.Group,
            finalFilter: {
                $and: [
                    { myAvg: { $gt: 0 } },
                    { mySum: { $gt: 0 } }
                ],
            },
        }, { responseType: 'stream', ...authAdmin })
        
        await expect(streamToArray(response.data)).resolves.toEqual(
            expect.arrayContaining([{ item: { 
                _id: ctx.numberItem._id,
                _owner: ctx.numberItem._owner,
                myAvg: ctx.numberItem[ctx.numberColumns[0].name],
                mySum: ctx.numberItem[ctx.numberColumns[1].name]
                } },
                pagingMetadata(1, 1)
        ]))
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ DeleteImmediately ])('bulk delete api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await givenItems(ctx.items, ctx.collectionName, authAdmin)

        const response = await axiosInstance.post('/data/remove', { 
            collectionId: ctx.collectionName, itemIds: ctx.items.map((i: { _id: any }) => i._id) 
        } as dataSpi.RemoveRequest, { responseType: 'stream', transformRequest: authAdmin.transformRequest })

        const expectedItems = ctx.items.map(item => ({ item: item } as dataSpi.RemoveResponsePart))

        await expect(streamToArray(response.data)).resolves.toEqual(expect.arrayContaining(expectedItems))
        await expect(queryCollectionAsArray(ctx.collectionName, [], undefined)).resolves.toEqual([pagingMetadata(0, 0)])
    })

    test('query by id api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await givenItems([ctx.item], ctx.collectionName, authAdmin) 

        const filter = {
            _id: { $eq: ctx.item._id }
        }

        await expect(queryCollectionAsArray(ctx.collectionName, undefined, undefined, filter)).resolves.toEqual(
            ([...[dataSpi.QueryResponsePart.item(ctx.item)], pagingMetadata(1, 1)])
        )
    })

    test('query by id api should return empty result if not found', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await givenItems([ctx.item], ctx.collectionName, authAdmin)

        const filter = {
            _id: { $eq: 'wrong' }
        }

        await expect(queryCollectionAsArray(ctx.collectionName, undefined, undefined, filter)).resolves.toEqual(
            ([pagingMetadata(0, 0)])
        )
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ Projection ])('query by id api with projection', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await givenItems([ctx.item], ctx.collectionName, authAdmin)

        const filter = {
            _id: { $eq: ctx.item._id }
        }

        await expect(queryCollectionAsArray(ctx.collectionName, undefined, [ctx.column.name], filter)).resolves.toEqual(
            ([dataSpi.QueryResponsePart.item({ [ctx.column.name]: ctx.item[ctx.column.name] }), pagingMetadata(1, 1)])
        )
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ UpdateImmediately ])('update api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await givenItems(ctx.items, ctx.collectionName, authAdmin)
        const response = await axiosInstance.post('/data/update', updateRequest(ctx.collectionName, ctx.modifiedItems),  { responseType: 'stream', transformRequest: authAdmin.transformRequest })

        const expectedItems = ctx.modifiedItems.map(item => ({ item: item } as dataSpi.QueryResponsePart))

        await expect(streamToArray(response.data)).resolves.toEqual(expectedItems)

        await expect(queryCollectionAsArray(ctx.collectionName, [], undefined)).resolves.toEqual(expect.arrayContaining(
            [ 
                ...expectedItems, 
                pagingMetadata(ctx.modifiedItems.length, ctx.modifiedItems.length)
            ]))
    })

    test('count api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await givenItems([ctx.item, ctx.anotherItem], ctx.collectionName, authAdmin)
        await expect( axiosInstance.post('/data/count', countRequest(ctx.collectionName), authAdmin) ).resolves.toEqual(matchers.responseWith( { totalCount: 2 } ))
    })


    testIfSupportedOperationsIncludes(supportedOperations, [ Truncate ])('truncate api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await givenItems([ctx.item, ctx.anotherItem], ctx.collectionName, authAdmin)
        await axiosInstance.post('/data/truncate', { collectionId: ctx.collectionName } as dataSpi.TruncateRequest, authAdmin)
        await expect(queryCollectionAsArray(ctx.collectionName, [], undefined)).resolves.toEqual([pagingMetadata(0, 0)])
    })



    const ctx = {
        collectionName: Uninitialized,
        column: Uninitialized,
        numberColumns: Uninitialized,
        item: Uninitialized,
        items: Uninitialized,
        modifiedItem: Uninitialized,
        modifiedItems: Uninitialized,
        anotherItem: Uninitialized,
        numberItem: Uninitialized,
        anotherNumberItem: Uninitialized,
    }

    afterAll(async() => await teardownApp())

    beforeEach(async() => {
        ctx.collectionName = gen.randomCollectionName()
        ctx.column = gen.randomColumn()
        ctx.numberColumns = gen.randomNumberColumns()
        ctx.item = genCommon.randomEntity([ctx.column.name])
        ctx.items = Array.from({ length: 10 }, () => genCommon.randomEntity([ctx.column.name]))
        ctx.modifiedItems = ctx.items.map((i: any) => ( { ...i, [ctx.column.name]: chance.word() } ) )
        ctx.modifiedItem = { ...ctx.item, [ctx.column.name]: chance.word() }
        ctx.anotherItem = genCommon.randomEntity([ctx.column.name])
        ctx.numberItem = gen.randomNumberDbEntity(ctx.numberColumns)
        ctx.anotherNumberItem = gen.randomNumberDbEntity(ctx.numberColumns)
    })
})
