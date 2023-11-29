import { Firestore } from '@google-cloud/firestore'
import { validateSystemFields, errors, EmptyCapabilities } from '@wix-velo/velo-external-db-commons'
import {
    InputField,
    ISchemaProvider,
    Table,
    SchemaOperations,
    CollectionCapabilities, Encryption, PagingMode
} from '@wix-velo/velo-external-db-types'
import { table } from './types'
import {
    CollectionOperations,
    FieldTypes,
    ReadWriteOperations,
    ColumnsCapabilities
} from './firestore_capabilities'

const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist } = errors

const SystemTable = '_descriptor'
export default class SchemaProvider implements ISchemaProvider {
    database: Firestore
    constructor(database: Firestore) {
        this.database = database
    }

    reformatFields(field: InputField) {
        return {
            field: field.name,
            type: field.type,
            capabilities: this.fieldCapabilities(field)
        }
    }

    async list(): Promise<Table[]> {
        const l = await this.database.collection(SystemTable).get()
        const tables: {[x:string]: table[]} = l.docs.reduce((o, d) => ({ ...o, [d.id]: d.data() }), {})

        return Object.entries(tables)
            .map(([collectionName, rs]: [string, any]) => ({
                id: collectionName,
                fields: [...rs.fields].map( this.reformatFields.bind(this) ),
                capabilities: this.collectionCapabilities()
            }))
    }

    async listHeaders() {
        const l = await this.database.collection(SystemTable).get()
        return l.docs.map(rs => rs.id)
    }

    supportedOperations() {
        const { List, ListHeaders, Create, Drop, AddColumn, RemoveColumn, Describe, BulkDelete, Truncate, DeleteImmediately, UpdateImmediately } = SchemaOperations

        return [ List, ListHeaders, Create, Drop, AddColumn, RemoveColumn, Describe, BulkDelete, Truncate, DeleteImmediately, UpdateImmediately ]
    }


    async create(collectionName: string, columns: InputField[]) {
        const coll = await this.database.collection(SystemTable)
                                        .doc(collectionName)
                                        .get()
        if (!coll.exists) {
            await this.database.collection(SystemTable)
                               .doc(collectionName)
                               .set({
                                   id: collectionName,
                                   fields: columns || []
                               })
        }
    }

    async addColumn(collectionName: string, column: InputField) {
        await validateSystemFields(column.name)

        const collectionRef = this.database.collection(SystemTable).doc(collectionName)
        const collection = await collectionRef.get()

        if (!collection.exists) {
            throw new CollectionDoesNotExists('Collection does not exists', collectionName)
        }
        const { fields } = collection.data() as { id: string, fields: { type: string, subtype: string, name: string}[]}

        if (fields.find((f: { name: string }) => f.name === column.name)) {
            throw new FieldAlreadyExists('Collection already has a field with the same name')
        }

        await collectionRef.update({
            fields: [...fields, column]
        })
    }

    async removeColumn(collectionName: string, columnName: string) {
        await validateSystemFields(columnName)

        const collectionRef = this.database.collection(SystemTable).doc(collectionName)
        const collection = await collectionRef.get()

        if (!collection.exists) {
            throw new CollectionDoesNotExists('Collection does not exists', collectionName)
        }
        const { fields } = collection.data() as any

        if (!fields.find((f: { name: string }) => f.name === columnName)) {
            throw new FieldDoesNotExist('Collection does not contain a field with this name')
        }

        await collectionRef.update({
            fields: fields.filter((f: { name: any }) => f.name !== columnName)
        })
    }

    async changeColumnType(collectionName: string, column: InputField): Promise<void> {
        const collectionRef = this.database.collection(SystemTable).doc(collectionName)
        const collection = await collectionRef.get()

        if (!collection.exists) {
            throw new CollectionDoesNotExists('Collection does not exists', collectionName)
        }

        const { fields } = collection.data() as any

        await collectionRef.update({
            fields: [...fields, column]
        })
    }

    async describeCollection(collectionName: string): Promise<Table> {
        const collection = await this.database.collection(SystemTable)
            .doc(collectionName)
            .get()

        if (!collection.exists) {
            throw new CollectionDoesNotExists('Collection does not exists', collectionName)
        }

        const { fields } = collection.data() as any

        return {
            id: collectionName,
            fields: fields.map( this.reformatFields.bind(this) ),
            capabilities: this.collectionCapabilities()
        }
    }

    async drop(collectionName: string) {
        // todo: drop collection https://firebase.google.com/docs/firestore/manage-data/delete-data
        await this.database.collection(SystemTable).doc(collectionName).delete()
    }

    private fieldCapabilities(field: InputField) {
        return ColumnsCapabilities[field.type as keyof typeof ColumnsCapabilities] ?? EmptyCapabilities
    }

    private collectionCapabilities(): CollectionCapabilities {
        return {
            dataOperations: ReadWriteOperations,
            fieldTypes: FieldTypes,
            collectionOperations: CollectionOperations,
            referenceCapabilities: { supportedNamespaces: [] },
            indexing: [],
            encryption: Encryption.notSupported,
            pagingMode: PagingMode.offset
        }
    }
}

