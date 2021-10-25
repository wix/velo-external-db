const SchemaColumnTranslator = require('./sql_schema_translator')
const { asWixSchema } = require('velo-external-db-commons')
const { SystemFields } = require('velo-external-db-commons')

const axios = require('axios')

class SchemaProvider {
    constructor(base, apiKey, metaApiKey, baseUrl) {
        this.base = base
        this.baseId = base.getId()
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
        const response = await this.axios.get(`v0/meta/bases/${this.baseId}/tables`)
        const tables = this.extractTableData(response.data)
        return Object.entries(tables)
            .map(([collectionName, rs]) => asWixSchema(rs.fields, collectionName))
    }

    async create(collectionName) {
        const systemColumnsAsAirTableColumns = SystemFields.map(field => this.sqlSchemaTranslator.wixColumnToAirtableColumn(field))
        await this.axios.post(`v0/meta/bases/${this.baseId}/table`, { collectionName, columns: systemColumnsAsAirTableColumns })
    }

    async addColumn(collectionName, column) {
        await this.axios.post(`v0/meta/bases/${this.baseId}/tables/${collectionName}/addColumn`,
            { column: this.sqlSchemaTranslator.wixColumnToAirtableColumn(column) })
    }

    async removeColumn(collectionName, columnName) {
        await this.axios.post(`v0/meta/bases/${this.baseId}/tables/${collectionName}/removeColumn`,
            { column: columnName })
    }


    async describeCollection(collectionName) {
        return (await this.list()).find(schemas => schemas.id === collectionName)
    }


    translateDbTypes(type) {
        return this.sqlSchemaTranslator.translateType(type)
    }

    extractTableData(data) {
        return data.tables
            .reduce((pV, cV) => ({
                ...pV,
                [cV.name]: {
                      fields: cV.fields
                        .map(field => ({ field: field.name, type: this.translateDbTypes(field.type) }))
                }
            }), {})

    }
}

module.exports = SchemaProvider
