const SchemaColumnTranslator = require('./sql_schema_translator')
const { asWixSchema } = require('velo-external-db-commons')

const axios = require('axios').create({
    baseURL: 'https://api.airtable.com',
});


class SchemaProvider {
    constructor(pool, apiKey, metaApiKey) {
        this.pool = pool
        this.apiKey = apiKey
        this.metaApiKey = metaApiKey
        this.sqlSchemaTranslator = new SchemaColumnTranslator()
    }

    async list() {
        const baseId = this.pool.getId()

        const response = await axios.get(`v0/meta/bases/${baseId}/tables`, {
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'X-Airtable-Client-Secret': this.metaApiKey
            }
        })
        const tables = response.data
                               .tables
                               .reduce((pV, cV) => ({
                                   ...pV,
                                   [cV.name]: { fields: cV.fields
                                                          .map(field => ( { field: field.name, type: this.translateDbTypes(field.type) } )) }
                               }), {})

        return Object.entries(tables)
                     .map(([collectionName, rs]) => asWixSchema(rs.fields, collectionName))
    }


    async describeCollection(collectionName) {
        return (await this.list()).filter(schemas => schemas.id === collectionName)
    }

    translateDbTypes(type) {
        return this.sqlSchemaTranslator.translateType(type)
    }

}

module.exports = SchemaProvider
