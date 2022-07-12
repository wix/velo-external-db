import SchemaColumnTranslator, { IAirtableSchemaColumnTranslator } from './sql_schema_translator'
import { SystemFields, validateSystemFields } from '@wix-velo/velo-external-db-commons'
import axios, { Axios } from 'axios'
import { Base } from 'airtable'
import { InputField, ISchemaProvider, ResponseField, SchemaOperations, Table, TableHeader } from '@wix-velo/velo-external-db-types'
import { errors } from '@wix-velo/velo-external-db-commons'
const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist } = errors

export default class SchemaProvider implements ISchemaProvider {
    base: Base
    baseId: string
    sqlSchemaTranslator: IAirtableSchemaColumnTranslator
    axios: Axios
    constructor(base: any, { apiKey, metaApiKey, baseUrl }: any) {
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
        return response.data.tables.map((rs: { name: any }) => rs.name)
    }

    supportedOperations()  {
        const { List, ListHeaders, Create, Drop, AddColumn, RemoveColumn, Describe, BulkDelete, Truncate, DeleteImmediately, UpdateImmediately } = SchemaOperations

        return [ List, ListHeaders, Create, Drop, AddColumn, RemoveColumn, Describe, BulkDelete, Truncate, DeleteImmediately, UpdateImmediately ]
    }


    async create(collectionName: any) {
        const systemColumnsAsAirTableColumns = SystemFields.map(field => this.sqlSchemaTranslator.wixColumnToAirtableColumn(field))
        await this.axios.post(`v0/meta/bases/${this.baseId}/table`, { collectionName, columns: systemColumnsAsAirTableColumns })
    }

    async drop(collectionName: any) {
        await this.axios.post(`v0/meta/bases/${this.baseId}/table/drop`, { collectionName })
    }

    async addColumn(collectionName: any, column: InputField) {
        await validateSystemFields(column.name)
        const collection = await this.describeCollection(collectionName)
        if (!collection)
            throw new CollectionDoesNotExists('Collection does not exists')

        if (this.columnExists(collection, column.name))
            throw new FieldAlreadyExists('Collection already has a field with the same name')

        await this.axios.post(`v0/meta/bases/${this.baseId}/tables/${collectionName}/addColumn`,
            { column: this.sqlSchemaTranslator.wixColumnToAirtableColumn(column) })
    }

    async removeColumn(collectionName: any, columnName: string) {
        await validateSystemFields(columnName)
        const collection = await this.describeCollection(collectionName)
        if (!collection)
            throw new CollectionDoesNotExists('Collection does not exists')
        if (!this.columnExists(collection, columnName))
            throw new FieldDoesNotExist('Collection does not contain a field with this name')

        await this.axios.post(`v0/meta/bases/${this.baseId}/tables/${collectionName}/removeColumn`,
            { column: columnName })
    }


    async describeCollection(collectionName: string) {
        const collection = (await this.list()).find(schemas => schemas.id === collectionName)
        if (!collection)
            throw new CollectionDoesNotExists('Collection does not exists')
        return collection.fields
    }

    translateDbTypes(type: string) {
        return this.sqlSchemaTranslator.translateType(type)
    }

    extractTableData(data: { tables: any[] }): { [key: string]: { fields: any } } {
        return data.tables
            .reduce((pV: any, cV: { name: any; fields: any[] }) => ({
                ...pV,
                [cV.name]: {
                    fields: cV.fields
                        .map((field: { name: any; type: any }) => ({ field: field.name, type: this.translateDbTypes(field.type) }))
                }
            }), {})

    }

    columnExists(fields: any[], columnName: any) {
        return fields.some((f: { field: any }) => f.field === columnName)
    }

}
