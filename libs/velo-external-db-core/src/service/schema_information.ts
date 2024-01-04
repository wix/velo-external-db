import { errors } from '@wix-velo/velo-external-db-commons'
import { ISchemaProvider, ResponseField, Table } from '@wix-velo/velo-external-db-types'
const { CollectionDoesNotExists } = errors
import * as NodeCache from 'node-cache'

const FiveMinutes = 5 * 60

export default class CacheableSchemaInformation {
    schemaProvider: ISchemaProvider
    cache: NodeCache
    constructor(schemaProvider: any) {
        this.schemaProvider = schemaProvider
        this.cache = new NodeCache( { checkperiod: FiveMinutes + 10 } )
    }
    
    async schemaFieldsFor(collectionName: string): Promise<ResponseField[]> {
        return (await this.schemaFor(collectionName)).fields
    }

    async schemaFor(collectionName: string): Promise<Table> {
        const schema = this.cache.get(collectionName)
        if ( !schema ) {
            await this.update(collectionName)
            return this.cache.get(collectionName) as Table 
        }
        return schema as Table
    }

    async update(collectionName: string) {
        const collection = await this.schemaProvider.describeCollection(collectionName)
        if (!collection) throw new CollectionDoesNotExists('Collection does not exists', collectionName)
        this.cache.set(collectionName, collection, FiveMinutes)
    }

    async refresh() {
        await this.clear()
        const schema = await this.schemaProvider.list()
        if (schema && schema.length) 
            schema.forEach((collection: Table) => {
                this.cache.set(collection.id, collection, FiveMinutes)
            })
    }

    async clear() {
        this.cache.flushAll()
    }

}
