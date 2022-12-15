import axios from 'axios'
import Chance = require('chance')
import { Uninitialized, gen as genCommon, testIfSupportedOperationsIncludes, streamToArray } from '@wix-velo/test-commons'
import { SchemaOperations } from '@wix-velo/velo-external-db-types'
import { dataSpi } from '@wix-velo/velo-external-db-core'
import { authAdmin, authOwner, authVisitor } from '@wix-velo/external-db-testkit'
import * as gen from '../gen'
import * as schema from '../drivers/schema_api_rest_test_support'
import * as matchers from '../drivers/schema_api_rest_matchers'
import * as data from '../drivers/data_api_rest_test_support'
import * as authorization from '../drivers/authorization_test_support'
import { initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName, supportedOperations } from '../resources/e2e_resources'
const { UpdateImmediately, DeleteImmediately, Truncate, Aggregate, FindWithSort, Projection, FilterByEveryField } = SchemaOperations

const chance = Chance()

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080'
})

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
        await data.givenItems([ctx.item, ctx.anotherItem], ctx.collectionName, authAdmin)
        await authorization.givenCollectionWithVisitorReadPolicy(ctx.collectionName)

        const itemsByOrder = [ctx.item, ctx.anotherItem].sort((a, b) => (a[ctx.column.name] > b[ctx.column.name]) ? 1 : -1).map(item => ({ item }))
        
        await expect(data.queryCollectionAsArray(ctx.collectionName, [{ fieldName: ctx.column.name, order: dataSpi.SortOrder.ASC }], undefined, authVisitor)).resolves.toEqual(
            ([...itemsByOrder, data.pagingMetadata(2, 2)])
        )
    })
    
    testIfSupportedOperationsIncludes(supportedOperations, [FilterByEveryField])('find api - filter by date', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item], ctx.collectionName, authAdmin)
        const filterByDate = {
            _createdDate: { $gte: ctx.pastVeloDate }
        }


        await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner, filterByDate)).resolves.toEqual(
            expect.toIncludeSameMembers([{ item: ctx.item }, data.pagingMetadata(1, 1)]))
    })
    
    testIfSupportedOperationsIncludes(supportedOperations, [ Projection ])('find api with projection', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item ], ctx.collectionName, authAdmin)
       
        await expect(data.queryCollectionAsArray(ctx.collectionName, [], [ctx.column.name], authOwner)).resolves.toEqual(
            expect.toIncludeSameMembers([{ item: { [ctx.column.name]: ctx.item[ctx.column.name], _id: ctx.item._id } }, data.pagingMetadata(1, 1)])
        )                
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ FindWithSort ])('find api with omitTotalCount flag set to true', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item, ctx.anotherItem], ctx.collectionName, authAdmin)
        await authorization.givenCollectionWithVisitorReadPolicy(ctx.collectionName)
        await expect( axios.post('/data/find', { collectionName: ctx.collectionName, filter: '', sort: [{ fieldName: ctx.column.name }], skip: 0, limit: 25, omitTotalCount: true }, authVisitor) ).resolves.toEqual(
            expect.objectContaining({ data: {
                    items: [ ctx.item, ctx.anotherItem ].sort((a, b) => (a[ctx.column.name] > b[ctx.column.name]) ? 1 : -1),
                    totalCount: undefined
                } }))
    })
    
    //todo: create another test without sort for these implementations

    test('insert api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)

        const response = await axiosInstance.post('/data/insert', data.insertRequest(ctx.collectionName, ctx.items, false),  { responseType: 'stream', ...authAdmin })

        const expectedItems = ctx.items.map(item => ({ item }))

        await expect(streamToArray(response.data)).resolves.toEqual(expectedItems)
        await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner)).resolves.toEqual(expect.toIncludeSameMembers(
            [ 
                ...expectedItems, 
                data.pagingMetadata(ctx.items.length, ctx.items.length)
            ])
        )
    })

    test('insert api should fail if item already exists', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ ctx.items[0] ], ctx.collectionName, authAdmin)

        const response = axiosInstance.post('/data/insert', data.insertRequest(ctx.collectionName, ctx.items, false),  { responseType: 'stream', ...authAdmin })

        const expectedItems = [dataSpi.QueryResponsePart.item(ctx.items[0])]

        await expect(response).rejects.toThrow('400')

        await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner)).resolves.toEqual(expect.toIncludeAllMembers(
            [ 
                ...expectedItems, 
                data.pagingMetadata(expectedItems.length, expectedItems.length)
            ])
        )
    })

    test('insert api should succeed if item already exists and overwriteExisting is on', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ ctx.item ], ctx.collectionName, authAdmin)

        const response = await axiosInstance.post('/data/insert', data.insertRequest(ctx.collectionName, [ctx.modifiedItem], true),  { responseType: 'stream', ...authOwner })
        const expectedItems = [dataSpi.QueryResponsePart.item(ctx.modifiedItem)]

        await expect(streamToArray(response.data)).resolves.toEqual(expectedItems)
        await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner)).resolves.toEqual(expect.toIncludeAllMembers(
            [ 
                ...expectedItems, 
                data.pagingMetadata(expectedItems.length, expectedItems.length)
            ])
        )
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ Aggregate ])('aggregate api', async() => {
        
        await schema.givenCollection(ctx.collectionName, ctx.numberColumns, authOwner)
        await data.givenItems([ctx.numberItem, ctx.anotherNumberItem], ctx.collectionName, authOwner) 
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
            },
            finalFilter: {
                $and: [
                    { myAvg: { $gt: 0 } },
                    { mySum: { $gt: 0 } }
                ],
            },
        }, { responseType: 'stream', ...authOwner })
        
        await expect(streamToArray(response.data)).resolves.toEqual(
            expect.toIncludeSameMembers([{ item: { 
                _id: ctx.numberItem._id,
                _owner: ctx.numberItem._owner,
                myAvg: ctx.numberItem[ctx.numberColumns[0].name],
                mySum: ctx.numberItem[ctx.numberColumns[1].name]
                } },
                data.pagingMetadata(1, 1)
        ]))
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ DeleteImmediately ])('bulk delete api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems(ctx.items, ctx.collectionName, authAdmin)

        const response = await axiosInstance.post('/data/remove', { 
            collectionId: ctx.collectionName, itemIds: ctx.items.map(i => i._id) 
        }, { responseType: 'stream', ...authAdmin })

        const expectedItems = ctx.items.map(item => ({ item }))

        await expect(streamToArray(response.data)).resolves.toEqual(expect.toIncludeSameMembers(expectedItems))
        await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner)).resolves.toEqual([data.pagingMetadata(0, 0)])
    })

    test('query by id api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item], ctx.collectionName, authAdmin) 

        const filter = {
            _id: { $eq: ctx.item._id }
        }

        await expect(data.queryCollectionAsArray(ctx.collectionName, undefined, undefined, authOwner, filter)).resolves.toEqual(expect.toIncludeSameMembers(
            [...[dataSpi.QueryResponsePart.item(ctx.item)], data.pagingMetadata(1, 1)])
        )
    })

    test('query by id api should return empty result if not found', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item], ctx.collectionName, authAdmin)

        const filter = {
            _id: { $eq: 'wrong' }
        }

        await expect(data.queryCollectionAsArray(ctx.collectionName, undefined, undefined, authOwner, filter)).resolves.toEqual(
            ([data.pagingMetadata(0, 0)])
        )
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ Projection ])('query by id api with projection', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item], ctx.collectionName, authAdmin)

        const filter = {
            _id: { $eq: ctx.item._id }
        }

        await expect(data.queryCollectionAsArray(ctx.collectionName, undefined, [ctx.column.name], authOwner, filter)).resolves.toEqual(expect.toIncludeSameMembers(
            [dataSpi.QueryResponsePart.item({ [ctx.column.name]: ctx.item[ctx.column.name], _id: ctx.item._id }), data.pagingMetadata(1, 1)])
        )
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ UpdateImmediately ])('update api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems(ctx.items, ctx.collectionName, authAdmin)
        const response = await axiosInstance.post('/data/update', data.updateRequest(ctx.collectionName, ctx.modifiedItems),  { responseType: 'stream', ...authAdmin })

        const expectedItems = ctx.modifiedItems.map(dataSpi.QueryResponsePart.item)

        await expect(streamToArray(response.data)).resolves.toEqual(expectedItems)

        await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner)).resolves.toEqual(expect.toIncludeSameMembers(
            [ 
                ...expectedItems, 
                data.pagingMetadata(ctx.modifiedItems.length, ctx.modifiedItems.length)
            ]))
    })

    test('count api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item, ctx.anotherItem], ctx.collectionName, authAdmin)
        await expect( axiosInstance.post('/data/count', data.countRequest(ctx.collectionName), authAdmin) ).resolves.toEqual(
            matchers.responseWith( { totalCount: 2 } ))
    })


    testIfSupportedOperationsIncludes(supportedOperations, [ Truncate ])('truncate api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item, ctx.anotherItem], ctx.collectionName, authAdmin)
        await axiosInstance.post('/data/truncate', { collectionId: ctx.collectionName }, authAdmin)
        await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner)).resolves.toEqual([data.pagingMetadata(0, 0)])
    })

    test('insert undefined to number columns should inserted as null', async() => {
        await schema.givenCollection(ctx.collectionName, ctx.numberColumns, authOwner)
        delete ctx.numberItem[ctx.numberColumns[0].name]
        delete ctx.numberItem[ctx.numberColumns[1].name]

        await axios.post('/data/insert', { collectionName: ctx.collectionName, item: ctx.numberItem }, authAdmin)


        await expect(data.expectAllDataIn(ctx.collectionName, authAdmin)).resolves.toEqual({
            items: [
                {
                    ...ctx.numberItem,
                    [ctx.numberColumns[0].name]: null,
                    [ctx.numberColumns[1].name]: null,
                }
            ], totalCount: 1
        })
    })


    test('update undefined to number columns should insert nulls', async() => {
        await schema.givenCollection(ctx.collectionName, ctx.numberColumns, authOwner)
        await data.givenItems([ctx.numberItem], ctx.collectionName, authAdmin)
        ctx.numberItem[ctx.numberColumns[0].name] = null
        ctx.numberItem[ctx.numberColumns[1].name] = null

        await axios.post('/data/update', { collectionName: ctx.collectionName, item: ctx.numberItem }, authAdmin)

        await expect(data.expectAllDataIn(ctx.collectionName, authAdmin)).resolves.toEqual({
            items: [
                {
                    ...ctx.numberItem,
                    [ctx.numberColumns[0].name]: null,
                    [ctx.numberColumns[1].name]: null,
                }
            ], totalCount: 1
        })
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
        pastVeloDate: Uninitialized,
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
        ctx.numberItem = genCommon.randomNumberEntity(ctx.numberColumns)
        ctx.anotherNumberItem = genCommon.randomNumberEntity(ctx.numberColumns)
        ctx.pastVeloDate = genCommon.pastVeloDate()
    })
})
