const { CollectionDoesNotExists } = require('velo-external-db-commons').errors
const NodeCache = require('node-cache')

const FiveMinutes = 5 * 60

class CacheableSchemaInformation {
    constructor(schemaProvider) {
        this.schemaProvider = schemaProvider
        this.cache = new NodeCache( { checkperiod: FiveMinutes + 10 } )

        const refreshFunc = async() => {
            await this.refresh()
                      .catch( console.log )
        }
        setImmediate(refreshFunc)
    }
    
    async schemaFieldsFor(collectionName) {
        const schema = this.cache.get(collectionName)
        if ( !schema ) {
            await this.update(collectionName)
            return this.cache.get(collectionName) 
        }
        return schema
    }

    async update(collectionName) {
        const collection = await this.schemaProvider.describeCollection(collectionName)
        if (!collection) throw new CollectionDoesNotExists('Collection does not exists')
        this.cache.set(collectionName, collection, FiveMinutes)
    }

    async refresh() {
        const schema = await this.schemaProvider.list()
        if (schema && schema.length) 
            schema.forEach(collection => {
                this.cache.set(collection.id, collection.fields, FiveMinutes)
            })
    }

    async clear() {
        this.cache.flushAll()
    }

}

module.exports = CacheableSchemaInformation