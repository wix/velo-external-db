const { CollectionDoesNotExists } = require('velo-external-db-commons').errors
const NodeCache = require('node-cache')

const CacheKey = 'schema'

const FiveMinutes = 5 * 60

class CacheableSchemaInformation {
    constructor(schemaProvider) {
        this.schemaProvider = schemaProvider
        this.cache = new NodeCache( { checkperiod: FiveMinutes + 10 } )

        const refreshFunc = async() => {
            await this.refresh()
                      .catch( console.log )
        }
        this.timer = setInterval(refreshFunc, FiveMinutes * 1000)
        setImmediate(refreshFunc)
    }

    async schemaFor(collectionName) {
        const schema = await this.schema()
        if (!schema.some(s => s.id === collectionName)) {
            throw new CollectionDoesNotExists('Collection does not exists')
        }

        return schema.find(s => s.id === collectionName)
    }

    async schemaFieldsFor(collectionName) {
        const s = await this.schemaFor(collectionName)
        return s.fields
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
        this.cache.set(CacheKey, schema, FiveMinutes)
    }

    async clear() {
        this.cache.flushAll()
    }

    cleanup() {
        this.timer.unref()
    }
}

module.exports = CacheableSchemaInformation