import { Uninitialized, gen as genCommon } from '@wix-velo/test-commons'
import { SchemaOperations } from '@wix-velo/velo-external-db-types'
const { UpdateImmediately, DeleteImmediately, Truncate, Aggregate, FindWithSort, Projection } = SchemaOperations
import { testIfSupportedOperationsIncludes } from '@wix-velo/test-commons'
import * as gen from '../gen'
import * as schema from '../drivers/schema_api_rest_test_support'
import * as data from '../drivers/data_api_rest_test_support'
import * as matchers from '../drivers/schema_api_rest_matchers'
import { authAdmin, authOwner, authVisitor } from '@wix-velo/external-db-testkit'
import * as authorization from '../drivers/authorization_test_support'
import Chance = require('chance')
import { initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName, supportedOperations } from '../resources/e2e_resources'
import { Options, QueryRequest, QueryV2, CountRequest, QueryResponsePart, UpdateRequest, TruncateRequest, RemoveRequest, RemoveResponsePart, InsertRequest } from 'libs/velo-external-db-core/src/spi-model/data_source'
import axios from 'axios'
import { streamToArray } from '@wix-velo/test-commons'

const chance = Chance()


const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080'
})

const queryRequest = (collectionName, sort, fields) => ({ 
    collectionId: collectionName,
    query: {
        filter: '',
        sort: sort,
        fields: fields,
        fieldsets: undefined,
        paging: {
            limit: 25,
            offset: 0,
        },
        cursorPaging: null
    } as QueryV2,
    includeReferencedItems: [],
    options: {
        consistentRead: false,
        appOptions: {},
    } as Options,
    omitTotalCount: false
} as QueryRequest)



const queryCollectionAsArray = (collectionName, sort, fields) => axiosInstance.post('/data/query', 
            queryRequest(collectionName, sort, fields), 
            {responseType: 'stream', transformRequest: authVisitor.transformRequest}).then(response => streamToArray(response.data))

const countRequest = (collectionName) => ({
    collectionId: collectionName,
    filter: '',
    options: {
        consistentRead: false,
        appOptions: {},
    } as Options,
}) as CountRequest  

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
    } as Options,
}) as UpdateRequest

const insertRequest = (collectionName, items, overwriteExisting) => ({
    collectionId: collectionName,
    items: items,
    overwriteExisting: overwriteExisting,
    options: {
        consistentRead: false,
        appOptions: {},
    } as Options,
} as InsertRequest)

const givenItems = async (items, collectionName, auth) => 
    axiosInstance.post('/data/insert', insertRequest(collectionName, items, false),  {responseType: 'stream', transformRequest: auth.transformRequest})

const pagingMetadata = (total, count) => ({pagingMetadata: {count: count, offset:0, total: total, tooManyToCount: false}} as QueryResponsePart)

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

        await expect(queryCollectionAsArray(ctx.collectionName, [{ fieldName: ctx.column.name }], undefined)).resolves.toEqual(
            expect.arrayContaining([{item: ctx.item} as QueryResponsePart, {item: ctx.anotherItem} as QueryResponsePart, pagingMetadata(2, 2)])
        )
    })
    
    testIfSupportedOperationsIncludes(supportedOperations, [ Projection ])('find api with projection', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await givenItems([ctx.item ], ctx.collectionName, authAdmin)


        const response = await axiosInstance.post('/data/query', 
            queryRequest(ctx.collectionName, [], [ctx.column.name]), 
            {responseType: 'stream', transformRequest: authVisitor.transformRequest}
        ) 
                
        await expect(queryCollectionAsArray(ctx.collectionName, [], [ctx.column.name])).resolves.toEqual(
            expect.arrayContaining([{item: {[ctx.column.name]: ctx.item[ctx.column.name]}}, pagingMetadata(1, 1)])
        )                
    })
    
    //todo: create another test without sort for these implementations

    test('insert api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)

        const response = await axiosInstance.post('/data/insert', insertRequest(ctx.collectionName, ctx.items, false),  {responseType: 'stream', transformRequest: authAdmin.transformRequest})

        const expectedItems = ctx.items.map(item => ({item: item} as QueryResponsePart))

        await expect(streamToArray(response.data)).resolves.toEqual(expectedItems)
        await expect(queryCollectionAsArray(ctx.collectionName, [], undefined)).resolves.toEqual(expect.arrayContaining(
            [ 
                ...expectedItems, 
                ...[pagingMetadata(ctx.items.length, ctx.items.length)]
            ]))
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ Aggregate ])('aggregate api', async() => {
        await schema.givenCollection(ctx.collectionName, ctx.numberColumns, authOwner)
        await givenItems([ctx.numberItem, ctx.anotherNumberItem], ctx.collectionName, authAdmin)

        await expect( axiosInstance.post('/data/aggregate',
            {
                collectionName: ctx.collectionName,
                filter: { _id: { $eq: ctx.numberItem._id } },
                processingStep: {
                    _id: {
                        field1: '$_id',
                        field2: '$_owner',
                    },
                    myAvg: {
                        $avg: `$${ctx.numberColumns[0].name}`
                    },
                    mySum: {
                        $sum: `$${ctx.numberColumns[1].name}`
                    }
                },
                postFilteringStep: {
                    $and: [
                        { myAvg: { $gt: 0 } },
                        { mySum: { $gt: 0 } }
                    ],
                },
            }, authAdmin) ).resolves.toEqual(matchers.responseWith({ items: [ { _id: ctx.numberItem._id, _owner: ctx.numberItem._owner, myAvg: ctx.numberItem[ctx.numberColumns[0].name], mySum: ctx.numberItem[ctx.numberColumns[1].name] } ],
            totalCount: 0 }))
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ DeleteImmediately ])('bulk delete api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await givenItems(ctx.items, ctx.collectionName, authAdmin)

        const response = await axiosInstance.post('/data/remove', { 
            collectionId: ctx.collectionName, itemIds: ctx.items.map((i: { _id: any }) => i._id) 
        } as RemoveRequest, {responseType: 'stream', transformRequest: authAdmin.transformRequest})

        const expectedItems = ctx.items.map(item => ({item: item} as RemoveResponsePart))

        await expect(streamToArray(response.data)).resolves.toEqual(expect.arrayContaining(expectedItems))
        await expect(queryCollectionAsArray(ctx.collectionName, [], undefined)).resolves.toEqual([pagingMetadata(0, 0)])
    })

    test('get by id api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await givenItems([ctx.item], ctx.collectionName, authAdmin)

        await expect( axiosInstance.post('/data/get', { collectionName: ctx.collectionName, itemId: ctx.item._id }, authAdmin) ).resolves.toEqual(matchers.responseWith({ item: ctx.item }))
    })

    test('get by id api should throw 404 if not found', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await givenItems([ctx.item], ctx.collectionName, authAdmin)

        await expect( axiosInstance.post('/data/get', { collectionName: ctx.collectionName, itemId: 'wrong' }, authAdmin) ).rejects.toThrow('404')
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ Projection ])('get by id api with projection', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await givenItems([ctx.item], ctx.collectionName, authAdmin)

        await expect(axiosInstance.post('/data/get', { collectionName: ctx.collectionName, itemId: ctx.item._id, projection: [ctx.column.name] }, authAdmin)).resolves.toEqual(
            matchers.responseWith({
                item: { [ctx.column.name]: ctx.item[ctx.column.name] }
            }))
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ UpdateImmediately ])('update api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await givenItems(ctx.items, ctx.collectionName, authAdmin)
        const response = await axiosInstance.post('/data/update', updateRequest(ctx.collectionName, ctx.modifiedItems),  {responseType: 'stream', transformRequest: authAdmin.transformRequest})

        const expectedItems = ctx.modifiedItems.map(item => ({item: item} as QueryResponsePart))

        await expect(streamToArray(response.data)).resolves.toEqual(expectedItems)

        await expect(queryCollectionAsArray(ctx.collectionName, [], undefined)).resolves.toEqual(expect.arrayContaining(
            [ 
                ...expectedItems, 
                ...[pagingMetadata(ctx.modifiedItems.length,ctx.modifiedItems.length)]
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
        await axiosInstance.post('/data/truncate', { collectionId: ctx.collectionName } as TruncateRequest, authAdmin)
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
