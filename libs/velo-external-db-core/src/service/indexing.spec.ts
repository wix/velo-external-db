import Chance = require('chance')
import { Uninitialized } from '@wix-velo/test-commons'
import { DomainIndex } from '@wix-velo/velo-external-db-types'
import * as gen from '../../test/gen'
import IndexService from './indexing'
import * as driver from '../../test/drivers/index_provider_test_support'
import { Index as SpiIndex, IndexField, IndexStatus } from '../spi-model/indexing'
const chance = new Chance()

describe('Index Service', () => {
    describe('transformers', () => {
        test('domainIndexToSpiIndex', () => {
            expect(env.indexService['domainIndexToSpiIndex'](ctx.index)).toEqual({
                name: ctx.index.name,
                fields: ctx.index.columns.map(column => ({ path: column, order: ctx.index.order })) as IndexField[],
                unique: ctx.index.isUnique,
                caseInsensitive: ctx.index.caseInsensitive,
                status: IndexStatus[ctx.index.status as keyof typeof IndexStatus],
            })
        })

        test('spiIndexToDomainIndex', () => {
            expect(env.indexService['spiIndexToDomainIndex'](ctx.spiIndex)).toEqual({
                name: ctx.spiIndex.name,
                columns: ctx.spiIndex.fields.map(field => field.path),
                isUnique: ctx.spiIndex.unique,
                caseInsensitive: ctx.spiIndex.caseInsensitive,
                order: ctx.spiIndex.fields[0].order,
            })
        })
    })

    test('list will issue a call to list and translate data to spi format', () => {
        driver.givenListResult(ctx.indexes, ctx.collectionName)

        return expect(env.indexService.list(ctx.collectionName)).resolves.toEqual(ctx.indexes.map(env.indexService['domainIndexToSpiIndex']))
    })

    test('create will issue a call to create and translate data to spi format', () => {
        driver.givenCreateResult(ctx.index, ctx.collectionName)

        return expect(env.indexService.create(ctx.collectionName, env.indexService['domainIndexToSpiIndex'](ctx.index)))
            .resolves.toEqual(env.indexService['domainIndexToSpiIndex'](ctx.index))
    })

    test('remove will issue a call to remove', () => {
        driver.givenRemoveResult(ctx.collectionName, ctx.index.name)

        return expect(env.indexService.remove(ctx.collectionName, ctx.index.name)).resolves.toEqual({})
    })
    

    const ctx: {
        collectionName: string
        indexes: DomainIndex[],
        index: DomainIndex,
        spiIndex: SpiIndex
    } = {
        collectionName: Uninitialized,
        indexes: Uninitialized,
        index: Uninitialized,
        spiIndex: Uninitialized,
    }
    const env: {
        indexService: IndexService
    } = {
        indexService: Uninitialized
    }

    beforeAll(() => {
        env.indexService = new IndexService(driver.indexProvider)
        ctx.collectionName = chance.word()
        ctx.indexes = gen.randomArrayOf(gen.randomDomainIndex)
        ctx.index = gen.randomDomainIndex()
        ctx.spiIndex = gen.randomSpiIndex()
    })

    afterEach(() => {
        driver.reset()
    })
})
