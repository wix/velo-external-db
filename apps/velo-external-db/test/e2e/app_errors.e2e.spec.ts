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
import { Options, QueryRequest, QueryV2, CountRequest, QueryResponsePart, UpdateRequest, TruncateRequest, RemoveRequest, RemoveResponsePart, InsertRequest, Group } from 'libs/velo-external-db-core/src/spi-model/data_source'
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
    } as QueryV2,
    includeReferencedItems: [],
    options: {
        consistentRead: false,
        appOptions: {},
    } as Options,
    omitTotalCount: false
} as QueryRequest)



const queryCollectionAsArray = (collectionName, sort, fields, filter?: any) => axiosInstance.post('/data/query', 
            queryRequest(collectionName, sort, fields, filter), 
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

describe(`Velo External Errors REST API: ${currentDbImplementationName()}`,  () => {
    beforeAll(async() => {
        await setupDb()
        await initApp()
    }, 20000)

    afterAll(async() => {
        await dbTeardown()
    }, 20000)

    test('create the same collection twice', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        // await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        

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
