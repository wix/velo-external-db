const SchemaColumnTranslator = require('./sql_schema_translator')
const { SystemFields, validateSystemFields, supportedSchemaOperationsFor } = require('velo-external-db-commons')
const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist } = require('velo-external-db-commons').errors

const axios = require('axios')
class SchemaProvider {
    constructor(base, { apiKey, metaApiKey, baseUrl }) {
        this.base = base
        this.baseId = base.getId()
        this.sqlSchemaTranslator = new SchemaColumnTranslator()

        this.axios = axios.create({
            baseURL: baseUrl || 'https://api.airtable.com',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'X-Airtable-Client-Secret': metaApiKey
            }
        })
    }

    async list() {
        const response = await this.axios.get(`v0/meta/bases/${this.baseId}/tables`)
        const tables = this.extractTableData(response.data)
        return Object.entries(tables)
                     .map(([collectionName, rs]) => ({
                         id: collectionName,
                         fields: rs.fields
                     }))
    }

    async listHeaders() {
        const response = await this.axios.get(`v0/meta/bases/${this.baseId}/tables`)
        return response.data.tables.map(rs => rs.name)
    }

    supportedOperations() {
        return supportedSchemaOperationsFor('airtable')
    }


    async create(collectionName) {
        const systemColumnsAsAirTableColumns = SystemFields.map(field => this.sqlSchemaTranslator.wixColumnToAirtableColumn(field))
        await this.axios.post(`v0/meta/bases/${this.baseId}/table`, { collectionName, columns: systemColumnsAsAirTableColumns })
    }

    async drop(collectionName) {
        await this.axios.post(`v0/meta/bases/${this.baseId}/table/drop`, { collectionName })
    }

    async addColumn(collectionName, column) {
        await validateSystemFields(column.name)
        const collection = await this.describeCollection(collectionName)
        if (!collection)
            throw new CollectionDoesNotExists('Collection does not exists')

        if (this.columnExists(collection, column.name))
            throw new FieldAlreadyExists('Collection already has a field with the same name')

        await this.axios.post(`v0/meta/bases/${this.baseId}/tables/${collectionName}/addColumn`,
            { column: this.sqlSchemaTranslator.wixColumnToAirtableColumn(column) })
    }

    async removeColumn(collectionName, columnName) {
        await validateSystemFields(columnName)
        const collection = await this.describeCollection(collectionName)
        if (!collection)
            throw new CollectionDoesNotExists('Collection does not exists')
        if (!this.columnExists(collection, columnName))
            throw new FieldDoesNotExist('Collection does not contain a field with this name')

        await this.axios.post(`v0/meta/bases/${this.baseId}/tables/${collectionName}/removeColumn`,
            { column: columnName })
    }


    async describeCollection(collectionName) {
        const collection = (await this.list()).find(schemas => schemas.id === collectionName)
        if (!collection)
            throw new CollectionDoesNotExists('Collection does not exists')
        return collection.fields
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

    columnExists(fields, columnName) {
        return fields.some(f => f.field === columnName)
    }

}

module.exports = SchemaProvider
