const { CollectionDoesNotExists } = require('velo-external-db-commons').errors
const NodeCache = require('node-cache')

const CacheKey = 'schema'

class CacheableSchemaInformation {
    constructor(schemaProvider) {
        this.schemaProvider = schemaProvider
        this.cache = new NodeCache( { stdTTL: 5 * 60, checkperiod: (5 * 60) + 10 } )
    }

    async schemaFor(collectionName) {
        const schema = await this.schema()
        if (!schema.some(s => s.id === collectionName)) {
            throw new CollectionDoesNotExists('Collection does not exists')
        }

        return schema.find(s => s.id === collectionName)
    }

    async schemaFieldsFor(collectionName) {
        const schema = await this.schemaFor(collectionName)
        return schema.fields
    }

    async schema() {
        const schema = this.cache.get(CacheKey)
        if ( schema === undefined ) {
            await this.refresh()
            return this.cache.get(CacheKey) || []
        }
        return schema
    }

    async refresh() {
        const schema = await this.schemaProvider.list()
        this.cache.set(CacheKey, schema)
    }
}

module.exports = CacheableSchemaInformation