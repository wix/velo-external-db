const SchemaColumnTranslator = require('./sql_schema_translator')
const { asWixSchema } = require('velo-external-db-commons')
const axios = require('axios')

class SchemaProvider {
    constructor(pool, apiKey, metaApiKey, baseUrl) {
        this.pool = pool
        this.sqlSchemaTranslator = new SchemaColumnTranslator()

        this.axios = axios.create({
            baseURL: baseUrl || 'https://api.airtable.com',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'X-Airtable-Client-Secret': metaApiKey
            }
        } )
    }

    async list() {
        const baseId = this.pool.getId()

        const response = await axios.get(`v0/meta/bases/${baseId}/tables`)
        const tables = this.extractTableData(response.data)
        return Object.entries(tables)
                     .map(([collectionName, rs]) => asWixSchema(rs.fields, collectionName))
    }

    async describeCollection(collectionName) {
        return (await this.list()).filter(schemas => schemas.id === collectionName)
    }


    translateDbTypes(type) {
        return this.sqlSchemaTranslator.translateType(type)
    }

    extractTableData(data) {
        return data.tables
                   .reduce((pV, cV) => ({
                           ...pV,
                           [cV.name]: { fields: cV.fields
                                                  .map(field => ( { field: field.name, type: this.translateDbTypes(field.type) } )) }
                   }), {})

    }
}

module.exports = SchemaProvider
