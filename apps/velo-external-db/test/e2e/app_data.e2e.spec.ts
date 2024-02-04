import axios from 'axios'
import each from 'jest-each'
import * as Chance from 'chance'
import { Uninitialized, gen as genCommon, testIfSupportedOperationsIncludes } from '@wix-velo/test-commons'
import { InputField, SchemaOperations, Item } from '@wix-velo/velo-external-db-types'
import { dataSpi } from '@wix-velo/velo-external-db-core'
import { authAdmin, authOwner, authVisitor } from '@wix-velo/external-db-testkit'
import * as gen from '../gen'
import * as schema from '../drivers/schema_api_rest_test_support'
import * as matchers from '../drivers/schema_api_rest_matchers'
import * as data from '../drivers/data_api_rest_test_support'
import * as authorization from '../drivers/authorization_test_support'
import { initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName, supportedOperations } from '../resources/e2e_resources'
const { UpdateImmediately, DeleteImmediately, Truncate, Aggregate, FindWithSort, Projection, FilterByEveryField, QueryNestedFields, PrimaryKey, AtomicBulkInsert, FindObject } = SchemaOperations

const chance = Chance()

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080/v3'
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

        const itemsByOrder = [ctx.item, ctx.anotherItem].sort((a, b) => (a[ctx.column.name] > b[ctx.column.name]) ? 1 : -1)
        
        await expect(data.queryCollectionAsArray(ctx.collectionName, [{ fieldName: ctx.column.name, order: dataSpi.SortOrder.ASC }], undefined, authVisitor)).resolves.toEqual({
            items: itemsByOrder,
            pagingMetadata: data.pagingMetadata(2, 2)
        })
    })
    
    testIfSupportedOperationsIncludes(supportedOperations, [FilterByEveryField])('find api - filter by date', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item], ctx.collectionName, authAdmin)
        const filterByDate = {
            _createdDate: { $gte: ctx.pastVeloDate }
        }


        await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner, filterByDate)).resolves.toEqual({
            items: expect.toIncludeSameMembers([ctx.item]),
            pagingMetadata: data.pagingMetadata(1, 1)
        })
    })
    
    testIfSupportedOperationsIncludes(supportedOperations, [ Projection ])('find api with projection', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item ], ctx.collectionName, authAdmin)
       
        await expect(data.queryCollectionAsArray(ctx.collectionName, [], [ctx.column.name], authOwner)).resolves.toEqual({
            items: expect.toIncludeSameMembers([{ [ctx.column.name]: ctx.item[ctx.column.name], _id: ctx.item._id } ]),
            pagingMetadata: data.pagingMetadata(1, 1)
        })                
    })
    
    //todo: create another test without sort for these implementations

    test('insert api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)

        const response = await axiosInstance.post('/items/insert', data.insertRequest(ctx.collectionName, ctx.items), authAdmin)

        expect(response.data).toEqual({ results: expect.toIncludeSameMembers(ctx.items.map(item => ({ item }))) })
    
        await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner)).resolves.toEqual({
            items: expect.toIncludeSameMembers(ctx.items),
            pagingMetadata: data.pagingMetadata(ctx.items.length, ctx.items.length)
        })
    })
    testIfSupportedOperationsIncludes(supportedOperations, [ AtomicBulkInsert, PrimaryKey ])('bulk insert api should return the inserted items if they don\'t exist and if they do, it should return an error object', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ ctx.items[1] ], ctx.collectionName, authAdmin)

        const response = await axiosInstance.post('/items/insert', data.insertRequest(ctx.collectionName, ctx.items), authAdmin)


        expect(response.data.results).toStrictEqual([
            { item: ctx.items[0] },
            { error: { errorCode: 'ITEM_ALREADY_EXISTS', errorMessage: expect.toInclude('Item already exists'), data: expect.any(Object) } },
            ...(ctx.items.slice(2, ctx.items.length).map( item => ({ item }) )),
        ])

        await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner)).resolves.toEqual({
            items: expect.toIncludeAllMembers(ctx.items),
            pagingMetadata: data.pagingMetadata(ctx.items.length, ctx.items.length)
        })


    })
    
    testIfSupportedOperationsIncludes(supportedOperations, [ Aggregate ])('aggregate api', async() => {
        
        await schema.givenCollection(ctx.collectionName, ctx.numberColumns, authOwner)
        await data.givenItems([ctx.numberItem, ctx.anotherNumberItem], ctx.collectionName, authOwner) 
        const response = await axiosInstance.post('/items/aggregate', {
            collectionId: ctx.collectionName,
            initialFilter: { _id: { $eq: ctx.numberItem._id } },
            aggregation: {
                groupingFields: ['_id', '_owner'],
                operations: [
                    { resultFieldName: 'myAvg', average: { itemFieldName: ctx.numberColumns[0].name } },
                    { resultFieldName: 'mySum', sum: { itemFieldName: ctx.numberColumns[1].name } },
                ]
            },
            finalFilter: {
                $and: [
                    { myAvg: { $gt: 0 } },
                    { mySum: { $gt: 0 } }
                ],
            },
            returnTotalCount: true,
        }, authOwner)
        
        expect(response.data).toEqual({
            items: expect.toIncludeSameMembers([
                {
                    _id: ctx.numberItem._id,
                    _owner: ctx.numberItem._owner,
                    myAvg: ctx.numberItem[ctx.numberColumns[0].name],
                    mySum: ctx.numberItem[ctx.numberColumns[1].name]
                }
            ]),
            pagingMetadata: data.pagingMetadata(1, 1)
        })
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ DeleteImmediately ])('bulk delete api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems(ctx.items, ctx.collectionName, authAdmin)
        await data.givenItems([ ctx.items[1] ], ctx.collectionName, authAdmin)
        const response = await axiosInstance.post('/items/remove', { 
            collectionId: ctx.collectionName, itemIds: ctx.items.map(i => i._id) 
        }, authAdmin)

        expect(response.data.results).toEqual(expect.toIncludeSameMembers(ctx.items.map( item => ({ item }) ) ))
        await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner)).resolves.toEqual({
            items: [],
            pagingMetadata: data.pagingMetadata(0, 0)
        })
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ DeleteImmediately ])('delete api should return deleted items if they exist and if they don\'t, it should return an error object', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ ctx.items[0] ], ctx.collectionName, authAdmin)

        const response = await axiosInstance.post('/items/remove', { 
            collectionId: ctx.collectionName, itemIds: ctx.items.map(i => i._id) 
        }, authAdmin)

        expect(response.data.results).toStrictEqual([
            { item: ctx.items[0] },
            ...ctx.items.slice(1, ctx.items.length).map(_i => ({
                error: {
                    errorCode: 'ITEM_NOT_FOUND',
                    errorMessage: expect.toInclude('Item doesn\'t exists'),
                    data: expect.any(Object)
                }
            }))
        ])


        await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner)).resolves.toEqual({
            items: [],
            pagingMetadata: data.pagingMetadata(0, 0)
        })
    })



    test('query by id api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item], ctx.collectionName, authAdmin) 

        const filter = {
            _id: { $eq: ctx.item._id }
        }

        await expect(data.queryCollectionAsArray(ctx.collectionName, undefined, undefined, authOwner, filter)).resolves.toEqual({
            items: expect.toIncludeSameMembers([ctx.item]),
            pagingMetadata: data.pagingMetadata(1, 1)
        })
    })

    test('query by id api should return empty result if not found', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item], ctx.collectionName, authAdmin)

        const filter = {
            _id: { $eq: 'wrong' }
        }

        await expect(data.queryCollectionAsArray(ctx.collectionName, undefined, undefined, authOwner, filter)).resolves.toEqual({
            items: [],
            pagingMetadata: data.pagingMetadata(0, 0)
        })
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ Projection ])('query by id api with projection', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item], ctx.collectionName, authAdmin)

        const filter = {
            _id: { $eq: ctx.item._id }
        }

        await expect(data.queryCollectionAsArray(ctx.collectionName, undefined, [ctx.column.name], authOwner, filter)).resolves.toEqual({
            items: [{ [ctx.column.name]: ctx.item[ctx.column.name], _id: ctx.item._id }],
            pagingMetadata: data.pagingMetadata(1, 1)
        })
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ UpdateImmediately ])('update api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems(ctx.items, ctx.collectionName, authAdmin)
        const response = await axiosInstance.post('/items/update', data.updateRequest(ctx.collectionName, ctx.modifiedItems),  authAdmin)

        expect(response.data.results).toEqual(ctx.modifiedItems.map( item => ({ item }) ))

        await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner)).resolves.toEqual({
                items: expect.toIncludeSameMembers(ctx.modifiedItems),
                pagingMetadata: data.pagingMetadata(ctx.modifiedItems.length, ctx.modifiedItems.length)
        })
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ UpdateImmediately ])('update api should return updated items if they exist and if they don\'t, it should return an error object', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems(ctx.items.slice(0, ctx.items.length - 1), ctx.collectionName, authAdmin)
        const response = await axiosInstance.post('/items/update', data.updateRequest(ctx.collectionName, ctx.modifiedItems),  authAdmin)

        expect(response.data.results).toEqual([
            ...(ctx.modifiedItems.slice(0, ctx.items.length - 1).map( item => ({ item }))),
            { 
                error: { 
                    errorCode: 'ITEM_NOT_FOUND', 
                    errorMessage: expect.toInclude('Item doesn\'t exists'), 
                    data: expect.any(Object) 
                } 
            }
        ])

        await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner)).resolves.toEqual({
                items: expect.toIncludeSameMembers(ctx.modifiedItems.slice(0, ctx.items.length - 1)),
                pagingMetadata: data.pagingMetadata(ctx.modifiedItems.length - 1, ctx.modifiedItems.length - 1)
        })
    })


    

    test('count api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item, ctx.anotherItem], ctx.collectionName, authAdmin)
        await expect( axiosInstance.post('/items/count', data.countRequest(ctx.collectionName), authAdmin) ).resolves.toEqual(
            matchers.responseWith( { totalCount: 2 } ))
    })


    testIfSupportedOperationsIncludes(supportedOperations, [ Truncate ])('truncate api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item, ctx.anotherItem], ctx.collectionName, authAdmin)
        await axiosInstance.post('/items/truncate', { collectionId: ctx.collectionName }, authAdmin)
        await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner)).resolves.toEqual({
            items: [],
            pagingMetadata: data.pagingMetadata(0, 0)
        })
    })

    test('insert undefined to number columns should inserted as null', async() => {
        await schema.givenCollection(ctx.collectionName, ctx.numberColumns, authOwner)
        delete ctx.numberItem[ctx.numberColumns[0].name]
        delete ctx.numberItem[ctx.numberColumns[1].name]
        
        await axiosInstance.post('/items/insert', data.insertRequest(ctx.collectionName, [ctx.numberItem]), authAdmin)

        await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner)).resolves.toEqual({
            items: expect.toIncludeSameMembers([{
                ...ctx.numberItem,
                [ctx.numberColumns[0].name]: null,
                [ctx.numberColumns[1].name]: null,
            }]),
            pagingMetadata: data.pagingMetadata(1, 1)
        })
    })


    testIfSupportedOperationsIncludes(supportedOperations, [ UpdateImmediately ])('update undefined to number columns should insert nulls', async() => {
        await schema.givenCollection(ctx.collectionName, ctx.numberColumns, authOwner)
        await data.givenItems([ctx.numberItem], ctx.collectionName, authAdmin)
        ctx.numberItem[ctx.numberColumns[0].name] = null
        ctx.numberItem[ctx.numberColumns[1].name] = null

        await axiosInstance.post('/items/update', data.updateRequest(ctx.collectionName, [ctx.numberItem]), authAdmin)
        

        await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner)).resolves.toEqual({
            items: expect.toIncludeSameMembers([{
                ...ctx.numberItem,
                [ctx.numberColumns[0].name]: null,
                [ctx.numberColumns[1].name]: null,
            }]),
            pagingMetadata: data.pagingMetadata(1, 1)
        })
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ FindObject ])('query on object fields', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.objectColumn], authOwner)
        await data.givenItems([ctx.objectItem], ctx.collectionName, authAdmin)

        const filter = {
            [ctx.objectColumn.name]: ctx.objectItem[ctx.objectColumn.name]
        }

        await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner, filter)).resolves.toEqual({
            items: expect.toIncludeSameMembers([ctx.objectItem]),
            pagingMetadata: data.pagingMetadata(1, 1)
        })
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ QueryNestedFields ])('query on nested fields', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.objectColumn], authOwner)
        await data.givenItems([ctx.objectItem], ctx.collectionName, authAdmin)

        const filter = {
            [`${ctx.objectColumn.name}.${ctx.nestedFieldName}`]: { $eq: ctx.objectItem[ctx.objectColumn.name][ctx.nestedFieldName] }
        }

        await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner, filter)).resolves.toEqual({
            items: expect.toIncludeSameMembers([ctx.objectItem]),
            pagingMetadata: data.pagingMetadata(1, 1)
        })
    })

    describe('error handling', () => {
        testIfSupportedOperationsIncludes(supportedOperations, [PrimaryKey])('insert api with duplicate _id should fail with ITEM_NOT_FOUND', async() => {
            await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
            await data.givenItems([ctx.item], ctx.collectionName, authAdmin)

            const response = await axiosInstance.post('/items/insert', data.insertRequest(ctx.collectionName, [ctx.item]), authAdmin)

            expect(response.data).toEqual(expect.objectContaining({
                results: [
                    {
                        error: {
                            errorCode: 'ITEM_ALREADY_EXISTS',
                            errorMessage: expect.toInclude('Item already exists'),
                            data: expect.any(Object)
                        }
                    }
                ]
            }))
        })

        each([
            ['update', '/items/update', data.updateRequest.bind(null, 'nonExistingCollection', [])],
            ['count', '/items/count', data.countRequest.bind(null, 'nonExistingCollection')],
            ['insert', '/items/insert', data.insertRequest.bind(null, 'nonExistingCollection', [], false)],
            ['query', '/items/query', data.queryRequest.bind(null, 'nonExistingCollection', [], undefined)],
        ])
        .test('%s api on non existing collection should fail with WDE0025, ITEM_NOT_FOUND', async(_, api, request) => {
            let error

            await axiosInstance.post(api, request(), authAdmin).catch(e => error = e)

            expect(error).toBeDefined()
            expect(error.response.status).toEqual(404)
            expect(error.response.data).toEqual(expect.objectContaining({
                errorCode: 'COLLECTION_NOT_FOUND',
                data: {
                    collectionId: 'nonExistingCollection'
                }
            }))
        })

        test('filter non existing column should fail with WDE0147, 400', async() => {
            await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
            let error

            await axiosInstance.post('/items/query', data.queryRequest(ctx.collectionName, [], undefined, { nonExistingColumn: { $eq: 'value' } }), authAdmin).catch(e => error = e)

            expect(error).toBeDefined()
            expect(error.response.status).toEqual(400)
            expect(error.response.data).toEqual(expect.objectContaining({
                errorCode: 'FIELD_DOESNT_EXIST',
                data: {
                    collectionId: ctx.collectionName,
                    propertyName: 'nonExistingColumn'
                }
            }))
        })
    })

    interface Ctx {
        collectionName: string
        column: InputField
        numberColumns: InputField[]
        objectColumn: InputField
        item:  Item
        items:  Item[]
        modifiedItem: Item
        modifiedItems: Item[]
        anotherItem: Item
        numberItem: Item
        anotherNumberItem: Item
        objectItem: Item
        nestedFieldName: string
        pastVeloDate: { $date: string; }
    }

    const ctx: Ctx  = {
        collectionName: Uninitialized,
        column: Uninitialized,
        numberColumns: Uninitialized,
        objectColumn: Uninitialized,
        item: Uninitialized,
        items: Uninitialized,
        modifiedItem: Uninitialized,
        modifiedItems: Uninitialized,
        anotherItem: Uninitialized,
        numberItem: Uninitialized,
        anotherNumberItem: Uninitialized,
        objectItem: Uninitialized,
        nestedFieldName: Uninitialized,
        pastVeloDate: Uninitialized,
    }

    afterAll(async() => await teardownApp())

    beforeEach(async() => {
        ctx.collectionName = gen.randomCollectionName()
        ctx.column = gen.randomColumn()
        ctx.numberColumns = gen.randomNumberColumns()
        ctx.objectColumn = gen.randomObjectColumn()
        ctx.item = genCommon.randomEntity([ctx.column.name])
        ctx.items = Array.from({ length: 10 }, () => genCommon.randomEntity([ctx.column.name]))
        ctx.modifiedItems = ctx.items.map((i: any) => ( { ...i, [ctx.column.name]: chance.word() } ) )
        ctx.modifiedItem = { ...ctx.item, [ctx.column.name]: chance.word() }
        ctx.anotherItem = genCommon.randomEntity([ctx.column.name])
        ctx.numberItem = genCommon.randomNumberEntity(ctx.numberColumns)
        ctx.anotherNumberItem = genCommon.randomNumberEntity(ctx.numberColumns)
        ctx.nestedFieldName = chance.word()
        ctx.objectItem = { ...genCommon.randomEntity(), [ctx.objectColumn.name]: { [ctx.nestedFieldName]: chance.word() } }
        ctx.pastVeloDate = genCommon.pastVeloDate()
    })
})
