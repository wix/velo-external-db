import { Uninitialized, testIfSupportedOperationsIncludes, shouldNotRunOn } from '@wix-velo/test-commons'
import { SchemaOperations } from '@wix-velo/velo-external-db-types'
const { FindWithSort, DeleteImmediately, Aggregate, UpdateImmediately, StartWithCaseSensitive, StartWithCaseInsensitive, Projection, Matches, NotOperator, FindObject, IncludeOperator } = SchemaOperations

import Chance = require('chance')
import gen = require('../gen')
import { env, dbTeardown, setupDb, currentDbImplementationName, supportedOperations } from '../resources/provider_resources'
import { entitiesWithOwnerFieldOnly, entityWithObjectField } from '../drivers/data_provider_matchers'
import { SystemFields } from '@wix-velo/velo-external-db-commons'
const chance = new Chance()

describe(`Data API: ${currentDbImplementationName()}`, () => {
    beforeAll(async() => {
        await setupDb()
    }, 20000)

    afterAll(async() => {
        await dbTeardown()
    }, 20000)


    const givenCollectionWith = async(entities, forCollection, fields) => {
        await env.dataProvider.insert(forCollection, entities, fields)
    }

    test('search with empty filter, default projection and empty order by and no data', async() => {
        env.driver.stubEmptyFilterFor(ctx.filter)
        env.driver.stubEmptyOrderByFor(ctx.sort)
        env.driver.givenAllFieldsProjectionFor?.(ctx.projection)
        await expect( env.dataProvider.find(ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit, ctx.projection) ).resolves.toEqual([])
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ FindWithSort ])('search with non empty filter, default projection will return data', async() => {
        await givenCollectionWith([ctx.entity, ctx.anotherEntity], ctx.collectionName, ctx.entityFields)
        env.driver.givenFilterByIdWith(ctx.entity._id, ctx.filter)
        env.driver.stubEmptyOrderByFor(ctx.sort)
        env.driver.givenAllFieldsProjectionFor?.(ctx.projection)
        await expect( env.dataProvider.find(ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit, ctx.projection) ).resolves.toEqual(expect.arrayContaining([ctx.entity]))
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ FindWithSort ])('search with non empty order by, default projection will return sorted data', async() => {
        await givenCollectionWith([ctx.entity, ctx.anotherEntity], ctx.collectionName, ctx.entityFields)
        env.driver.stubEmptyFilterFor(ctx.filter)
        env.driver.givenOrderByFor('_owner', ctx.sort)
        env.driver.givenAllFieldsProjectionFor?.(ctx.projection)
        await expect( env.dataProvider.find(ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit, ctx.projection) ).resolves.toEqual([ctx.anotherEntity, ctx.entity].sort((a, b) => (a._owner > b._owner) ? 1 : -1))
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ FindWithSort ])('search with empty order, filter and default projection but with limit and skip', async() => {
        await givenCollectionWith([ctx.entity, ctx.anotherEntity], ctx.collectionName, ctx.entityFields)
        env.driver.stubEmptyFilterFor(ctx.filter)
        env.driver.givenOrderByFor('_owner', ctx.sort)
        env.driver.givenAllFieldsProjectionFor?.(ctx.projection)
        await expect( env.dataProvider.find(ctx.collectionName, ctx.filter, ctx.sort, 1, 1, ctx.projection) ).resolves.toEqual([ctx.anotherEntity, ctx.entity].sort((a, b) => (a._owner < b._owner) ? 1 : -1).slice(0, 1))
    })


    testIfSupportedOperationsIncludes(supportedOperations, [ StartWithCaseSensitive ])('search with startsWith operator will return data', async() => {
        await givenCollectionWith([ctx.entity, ctx.anotherEntity], ctx.collectionName, ctx.entityFields)
        const firstHalfOfValue = ctx.entity[ctx.column.name].substring(0, ctx.column.name.length / 2)

        env.driver.givenStartsWithFilterFor(ctx.filter, ctx.column.name, firstHalfOfValue)
        env.driver.stubEmptyOrderByFor(ctx.sort)
        env.driver.givenAllFieldsProjectionFor?.(ctx.projection)
        await expect( env.dataProvider.find(ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit, ctx.projection) ).resolves.toEqual(expect.arrayContaining([ctx.entity]))
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ StartWithCaseInsensitive ])('search with startsWith operator will return data and be case-insensitive', async() => {
        await givenCollectionWith([ctx.entity, ctx.anotherEntity], ctx.collectionName, ctx.entityFields)
        const firstHalfOfValue = ctx.entity[ctx.column.name].substring(0, ctx.column.name.length / 2)
        const firstHalfOfValueToggled = firstHalfOfValue.toUpperCase() === firstHalfOfValue ? firstHalfOfValue.toLowerCase() : firstHalfOfValue.toUpperCase()

        env.driver.givenStartsWithFilterFor(ctx.filter, ctx.column.name, firstHalfOfValueToggled)
        env.driver.stubEmptyOrderByFor(ctx.sort)
        env.driver.givenAllFieldsProjectionFor?.(ctx.projection)
        await expect( env.dataProvider.find(ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit, ctx.projection) ).resolves.toEqual(expect.arrayContaining([ctx.entity]))
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ Projection ])('search with projection will return the specified fields', async() => {
        const projection = ['_owner']
        await givenCollectionWith(ctx.entities, ctx.collectionName, ctx.entityFields)
        env.driver.stubEmptyFilterFor(ctx.filter)
        env.driver.stubEmptyOrderByFor(ctx.sort)
        env.driver.givenProjectionExprFor(projection)
        await expect( env.dataProvider.find(ctx.collectionName, ctx.filter, ctx.sort, 0, 50, projection) ).resolves.toEqual(entitiesWithOwnerFieldOnly(ctx.entities))
    })

    if (shouldNotRunOn(['Airtable', 'Google-Sheet'], currentDbImplementationName())) {
        test('[gt] operator on string should return rows if bigger', async() => {
            await givenCollectionWith([ctx.entity], ctx.collectionName, ctx.entityFields)
            const smallerString = ctx.entity[ctx.column.name][0] !== 'a' ? String.fromCharCode(ctx.entity[ctx.column.name].charCodeAt(0) - 1) : 'a'

            env.driver.givenGreaterThenFilterFor(ctx.filter, ctx.column.name, smallerString)
            env.driver.stubEmptyOrderByFor(ctx.sort)
            env.driver.givenAllFieldsProjectionFor?.(ctx.projection)
            await expect( env.dataProvider.find(ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit, ctx.projection) ).resolves.toEqual(expect.arrayContaining([ctx.entity]))
        })

        testIfSupportedOperationsIncludes(supportedOperations, [ NotOperator])('query with not operator filter will return data', async() => { 
            await givenCollectionWith([ctx.entity, ctx.anotherEntity], ctx.collectionName, ctx.entityFields)
            env.driver.givenNotFilterQueryFor(ctx.filter, ctx.column.name, ctx.entity[ctx.column.name])
            env.driver.stubEmptyOrderByFor(ctx.sort)
            env.driver.givenAllFieldsProjectionFor?.(ctx.projection)
    
            await expect( env.dataProvider.find(ctx.collectionName, ctx.filter, ctx.sort, 0, 50, ctx.projection) ).resolves.toEqual([ctx.anotherEntity])
        })
    }    

    test('count will run query', async() => {
        await givenCollectionWith(ctx.entities, ctx.collectionName, ctx.entityFields)
        env.driver.stubEmptyFilterFor(ctx.filter)

        await expect( env.dataProvider.count(ctx.collectionName, ctx.filter) ).resolves.toEqual(ctx.entities.length)
    })

    test('count will run query with filter', async() => {
        await givenCollectionWith([ctx.entity, ctx.anotherEntity], ctx.collectionName, ctx.entityFields)
        env.driver.givenFilterByIdWith(ctx.entity._id, ctx.filter)

        await expect( env.dataProvider.count(ctx.collectionName, ctx.filter) ).resolves.toEqual(1)
    })

    test('insert data into collection name and query all of it', async() => {
        env.driver.stubEmptyFilterAndSortFor({}, '')
        env.driver.givenAllFieldsProjectionFor?.(ctx.projection)

        await expect( env.dataProvider.insert(ctx.collectionName, [ctx.entity], ctx.entityFields) ).resolves.toEqual(1)

        await expect( env.dataProvider.find(ctx.collectionName, {}, '', 0, 50, ctx.projection) ).resolves.toEqual([ctx.entity])
    })

    test('bulk insert data into collection name and query all of it', async() => { 
        env.driver.stubEmptyFilterAndSortFor({}, '')
        env.driver.givenAllFieldsProjectionFor?.(ctx.projection)

        await expect( env.dataProvider.insert(ctx.collectionName, ctx.entities, ctx.entityFields) ).resolves.toEqual(ctx.entities.length)

        await expect( env.dataProvider.find(ctx.collectionName, {}, '', 0, 50, ctx.projection) ).resolves.toEqual(expect.arrayContaining(ctx.entities))
    })

    test('insert entity with number', async() => {
        await env.schemaProvider.create(ctx.numericCollectionName, [...SystemFields, ...ctx.numericColumns])
        env.driver.stubEmptyFilterAndSortFor({}, '')
        env.driver.givenAllFieldsProjectionFor?.(ctx.projection)

        await expect( env.dataProvider.insert(ctx.numericCollectionName, [ctx.numberEntity], ctx.numberEntityFields)).resolves.toEqual(1)

        await expect( env.dataProvider.find(ctx.numericCollectionName, {}, '', 0, 50, ctx.projection) ).resolves.toEqual([ctx.numberEntity])
    })
    
    testIfSupportedOperationsIncludes(supportedOperations, [ FindObject ])('insert entity with object', async() => {
        await env.schemaProvider.create(ctx.objectCollectionName, [...SystemFields, ctx.objectColumn])
        env.driver.stubEmptyFilterAndSortFor({}, '')
        env.driver.givenAllFieldsProjectionFor?.(ctx.projection)
        
        await expect( env.dataProvider.insert(ctx.objectCollectionName, [ctx.objectEntity], ctx.objectEntityFields)).resolves.toEqual(1)
        await expect( env.dataProvider.find(ctx.objectCollectionName, {}, '', 0, 50, ctx.projection) ).resolves.toEqual(entityWithObjectField(ctx.objectEntity, ctx.objectEntityFields))
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ IncludeOperator ])('include operator on _id field', async() => {
        await givenCollectionWith([ctx.entity], ctx.collectionName, ctx.entityFields)
        env.driver.givenIncludeFilterForIdColumn(ctx.filter, ctx.entity._id)
        env.driver.stubEmptyOrderByFor(ctx.sort)
        env.driver.givenAllFieldsProjectionFor?.(ctx.projection)

        await expect( env.dataProvider.find(ctx.collectionName, ctx.filter, ctx.sort, 0, 50, ctx.projection) ).resolves.toEqual([ctx.entity])
    })
    
    testIfSupportedOperationsIncludes(supportedOperations, [ DeleteImmediately ])('delete data from collection', async() => {
        await givenCollectionWith(ctx.entities, ctx.collectionName, ctx.entityFields)
        env.driver.stubEmptyFilterAndSortFor({}, '')
        env.driver.givenAllFieldsProjectionFor?.(ctx.projection)

        await expect( env.dataProvider.delete(ctx.collectionName, ctx.entities.map(e => e._id)) ).resolves.toEqual(ctx.entities.length)

        await expect( env.dataProvider.find(ctx.collectionName, {}, '', 0, 50, ctx.projection) ).resolves.toEqual([])
    })
    
    testIfSupportedOperationsIncludes(supportedOperations, [ UpdateImmediately ])('allow update for single entity', async() => {
        await givenCollectionWith([ctx.entity], ctx.collectionName, ctx.entityFields)
        env.driver.stubEmptyFilterAndSortFor({}, '')
        env.driver.givenAllFieldsProjectionFor?.(ctx.projection)

        await expect( env.dataProvider.update(ctx.collectionName, [ctx.modifiedEntity]) ).resolves.toEqual(1)

        await expect( env.dataProvider.find(ctx.collectionName, {}, '', 0, 50, ctx.projection) ).resolves.toEqual([ctx.modifiedEntity])
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ UpdateImmediately ])('allow update for multiple entities', async() => {
        await givenCollectionWith(ctx.entities, ctx.collectionName, ctx.entityFields)
        env.driver.stubEmptyFilterAndSortFor({}, '')
        env.driver.givenAllFieldsProjectionFor?.(ctx.projection)

        expect( await env.dataProvider.update(ctx.collectionName, ctx.modifiedEntities) ).toEqual(ctx.modifiedEntities.length)

        expect( await env.dataProvider.find(ctx.collectionName, {}, '', 0, 50, ctx.projection) ).toEqual(expect.arrayContaining(ctx.modifiedEntities))
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ Matches ])('matches operator should return data', async() => {
        await givenCollectionWith([ctx.matchesEntity], ctx.collectionName, ctx.entityFields)
        env.driver.givenAllFieldsProjectionFor?.(ctx.projection)
        env.driver.stubEmptyOrderByFor(ctx.sort)
        env.driver.givenMatchesFilterFor(ctx.filter, ctx.column.name, ctx.matchesEntity[ctx.column.name])
        
        await expect( env.dataProvider.find(ctx.collectionName, ctx.filter, ctx.sort, 0, 50, ctx.projection) ).resolves.toEqual([ctx.matchesEntity])
    })

    test('truncate will remove all data from collection', async() => {
        await givenCollectionWith([ctx.entity], ctx.collectionName, ctx.entityFields)
        env.driver.stubEmptyFilterAndSortFor({}, '')
        env.driver.givenAllFieldsProjectionFor?.(ctx.projection)

        await env.dataProvider.truncate(ctx.collectionName)

        await expect( env.dataProvider.find(ctx.collectionName, {}, '', 0, 50, ctx.projection) ).resolves.toEqual([])
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ Aggregate ])('aggregate api without filter', async() => {
        await env.schemaProvider.create(ctx.numericCollectionName, [...SystemFields, ...ctx.numericColumns])
        await givenCollectionWith([ctx.numberEntity, ctx.anotherNumberEntity], ctx.numericCollectionName, ctx.numberEntityFields)

        env.driver.stubEmptyFilterFor(ctx.filter)
        env.driver.givenAggregateQueryWith(ctx.aggregation.processingStep, ctx.numericColumns, ctx.aliasColumns, ['_id'], ctx.aggregation.postFilteringStep, 1)
        env.driver.stubEmptyOrderByFor(ctx.sort)

        await expect( env.dataProvider.aggregate(ctx.numericCollectionName, ctx.filter, ctx.aggregation, ctx.sort, ctx.skip, ctx.limit) ).resolves.toEqual(expect.arrayContaining([{ _id: ctx.numberEntity._id, [ctx.aliasColumns[0]]: ctx.numberEntity[ctx.numericColumns[0].name], [ctx.aliasColumns[1]]: ctx.numberEntity[ctx.numericColumns[1].name] },
                                                        { _id: ctx.anotherNumberEntity._id, [ctx.aliasColumns[0]]: ctx.anotherNumberEntity[ctx.numericColumns[0].name], [ctx.aliasColumns[1]]: ctx.anotherNumberEntity[ctx.numericColumns[1].name] }
        ]))
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ Aggregate ])('aggregate api without having', async() => {
        await env.schemaProvider.create(ctx.numericCollectionName, [...SystemFields, ...ctx.numericColumns])
        await givenCollectionWith([ctx.numberEntity, ctx.anotherNumberEntity], ctx.numericCollectionName, ctx.numberEntityFields)

        env.driver.stubEmptyFilterFor(ctx.filter)
        env.driver.givenAggregateQueryWith(ctx.aggregation.processingStep, ctx.numericColumns, ctx.aliasColumns, ['_id'], ctx.aggregation.postFilteringStep, 1)
        env.driver.stubEmptyOrderByFor(ctx.sort)

        await expect( env.dataProvider.aggregate(ctx.numericCollectionName, ctx.filter, ctx.aggregation, ctx.sort, ctx.skip, ctx.limit) ).resolves.toEqual(expect.arrayContaining([{ _id: ctx.numberEntity._id, [ctx.aliasColumns[0]]: ctx.numberEntity[ctx.numericColumns[0].name], [ctx.aliasColumns[1]]: ctx.numberEntity[ctx.numericColumns[1].name] },
                                                                                                                                                        { _id: ctx.anotherNumberEntity._id, [ctx.aliasColumns[0]]: ctx.anotherNumberEntity[ctx.numericColumns[0].name], [ctx.aliasColumns[1]]: ctx.anotherNumberEntity[ctx.numericColumns[1].name] }
        ]))
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ Aggregate ])('aggregate api with filter', async() => {
        await env.schemaProvider.create(ctx.numericCollectionName, [...SystemFields, ...ctx.numericColumns])
        await givenCollectionWith([ctx.numberEntity, ctx.anotherNumberEntity], ctx.numericCollectionName, ctx.numberEntityFields)

        env.driver.givenFilterByIdWith(ctx.numberEntity._id, ctx.filter)
        env.driver.givenAggregateQueryWith(ctx.aggregation.processingStep, ctx.numericColumns, ctx.aliasColumns, ['_id'], ctx.aggregation.postFilteringStep, 2)
        env.driver.stubEmptyOrderByFor(ctx.sort)

        await expect( env.dataProvider.aggregate(ctx.numericCollectionName, ctx.filter, ctx.aggregation, ctx.sort, ctx.skip, ctx.limit) ).resolves.toEqual([{ _id: ctx.numberEntity._id, [ctx.aliasColumns[0]]: ctx.numberEntity[ctx.numericColumns[0].name], [ctx.aliasColumns[1]]: ctx.numberEntity[ctx.numericColumns[1].name] }])
    })
    

    const ctx = {
        collectionName: Uninitialized,
        numericCollectionName: Uninitialized,
        objectCollectionName: Uninitialized,
        filter: Uninitialized,
        aggregation: Uninitialized,
        sort: Uninitialized,
        skip: Uninitialized,
        limit: Uninitialized,
        projection: Uninitialized,
        column: Uninitialized,
        numericColumns: Uninitialized,
        objectColumn: Uninitialized,
        aliasColumns: Uninitialized,
        entity: Uninitialized,
        entityFields: Uninitialized,
        numberEntity: Uninitialized,
        objectEntity: Uninitialized,
        anotherNumberEntity: Uninitialized,
        modifiedEntity: Uninitialized,
        anotherEntity: Uninitialized,
        matchesEntity: Uninitialized,
        entities: Uninitialized,
        modifiedEntities: Uninitialized,
        numberEntityFields: Uninitialized,
        objectEntityFields: Uninitialized,
    }

    beforeEach(async() => {
        ctx.collectionName = gen.randomCollectionName()
        ctx.numericCollectionName = gen.randomCollectionName()
        ctx.objectCollectionName = gen.randomCollectionName()
        ctx.column = gen.randomColumn()
        ctx.numericColumns = gen.randomNumberColumns()
        ctx.objectColumn = gen.randomObjectColumn()
        ctx.aliasColumns = ctx.numericColumns.map(() => chance.word())
        ctx.filter = chance.word()
        ctx.aggregation = { processingStep: chance.word(), postFilteringStep: chance.word() }
        ctx.sort = chance.word()
        ctx.skip = 0
        ctx.limit = 10
        ctx.projection = chance.word()
        ctx.entity = gen.randomDbEntity([ctx.column.name])
        ctx.entityFields = Object.keys(ctx.entity).map(f => ({ field: f }))
        ctx.modifiedEntity = { ...ctx.entity, [ctx.column.name]: chance.word() }
        ctx.anotherEntity = gen.randomDbEntity([ctx.column.name])
        ctx.entities = gen.randomDbEntities([ctx.column.name])
        ctx.modifiedEntities = ctx.entities.map(e => ( { ...e, [ctx.column.name]: chance.word() } ))
        ctx.numberEntity = gen.randomNumberDbEntity(ctx.numericColumns)
        ctx.objectEntity = gen.randomObjectDbEntity([ctx.objectColumn])
        ctx.numberEntityFields = gen.systemFieldsWith(ctx.numericColumns)
        ctx.objectEntityFields = gen.systemFieldsWith([ctx.objectColumn])
        ctx.anotherNumberEntity = gen.randomNumberDbEntity(ctx.numericColumns)
        ctx.matchesEntity =  { ...ctx.entity, [ctx.column.name]: gen.randomMatchesValueWithDashes() }

        await env.schemaProvider.create(ctx.collectionName, [...SystemFields, ctx.column])
    })
})
