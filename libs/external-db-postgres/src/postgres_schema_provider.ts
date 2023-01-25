import { Pool } from 'pg'
import { SystemFields, validateSystemFields, parseTableData, AllSchemaOperations, errors } from '@wix-velo/velo-external-db-commons'
import { translateErrorCodes } from './sql_exception_translator'
import SchemaColumnTranslator from './sql_schema_translator'
import { escapeIdentifier, columnCapabilitiesFor } from './postgres_utils'
import {
    CollectionCapabilities,
    InputField,
    ISchemaProvider,
    ResponseField,
    Table
} from '@wix-velo/velo-external-db-types'
import { CollectionOperations, FieldTypes, ReadOnlyOperations, ReadWriteOperations } from './postgres_capabilities'

const { CollectionDoesNotExists } = errors

export default class SchemaProvider implements ISchemaProvider {
    sqlSchemaTranslator: SchemaColumnTranslator
    pool: Pool

    public constructor(pool: Pool) {
        this.pool = pool
        this.sqlSchemaTranslator = new SchemaColumnTranslator()
    }

    async list(): Promise<Table[]> {
        const data = await this.pool.query('SELECT table_name, column_name AS field, data_type, udt_name AS type FROM information_schema.columns WHERE table_schema = $1 ORDER BY table_name', ['public'])
        const tables = parseTableData(data.rows) as { [collectionName: string]: ResponseField[] }
        return Object.entries(tables)
                     .map(([collectionName, rs]) => ({
                         id: collectionName,
                         fields: rs.map( this.appendAdditionalRowDetails.bind(this) ),
                         capabilities: this.collectionCapabilities(rs.map(r => r.field))
                     }))
    }

    async listHeaders() {
        const data = await this.pool.query('SELECT table_name FROM information_schema.tables WHERE table_schema = $1 ORDER BY table_name', ['public'])
        return data.rows.map(rs => rs.table_name )
    }

    supportedOperations() {
        return AllSchemaOperations
    }

    async create(collectionName: string, _columns: any[]) {
        const columns = _columns || []
        const dbColumnsSql = [...SystemFields, ...columns].map( c => this.sqlSchemaTranslator.columnToDbColumnSql(c) )
                                                               .join(', ')
        const primaryKeySql = SystemFields.filter(f => f.isPrimary).map(f => escapeIdentifier(f.name)).join(', ')

        await this.pool.query(`CREATE TABLE IF NOT EXISTS ${escapeIdentifier(collectionName)} (${dbColumnsSql}, PRIMARY KEY (${primaryKeySql}))`)
                  .catch( translateErrorCodes )
    }

    async drop(collectionName: string) {
        await this.pool.query(`DROP TABLE IF EXISTS ${escapeIdentifier(collectionName)}`)
                  .catch( translateErrorCodes )
    }


    async addColumn(collectionName: string, column: InputField) {
        await validateSystemFields(column.name)

        await this.pool.query(`ALTER TABLE ${escapeIdentifier(collectionName)} ADD ${escapeIdentifier(column.name)} ${this.sqlSchemaTranslator.dbTypeFor(column)}`)
                  .catch( translateErrorCodes )
    }

    async changeColumnType(collectionName: string, column: InputField): Promise<void> {
        await validateSystemFields(column.name)
        const query = `ALTER TABLE ${escapeIdentifier(collectionName)} ALTER COLUMN ${escapeIdentifier(column.name)} TYPE ${this.sqlSchemaTranslator.dbTypeFor(column)} USING (${escapeIdentifier(column.name)}::${this.sqlSchemaTranslator.dbTypeFor(column)})`
        await this.pool.query(query)
            .catch( err => translateErrorCodes(err) )
    }

    async removeColumn(collectionName: string, columnName: string) {
        await validateSystemFields(columnName)

        await this.pool.query(`ALTER TABLE ${escapeIdentifier(collectionName)} DROP COLUMN ${escapeIdentifier(columnName)}`)
                         .catch( translateErrorCodes )

    }

    async describeCollection(collectionName: string): Promise<Table> {
        const res = await this.pool.query('SELECT table_name, column_name AS field, data_type, udt_name AS type, character_maximum_length FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 ORDER BY table_name', ['public', collectionName])
                              .catch( translateErrorCodes )
        if (res.rows.length === 0) {
            throw new CollectionDoesNotExists('Collection does not exists')
        }

        // return res.rows.map( this.translateDbTypes.bind(this) )
        const fields = res.rows.map(r => ({ field: r.field, type: r.type })).map(r => this.appendAdditionalRowDetails(r))
        return  {
            id: collectionName,
            fields: fields,
            capabilities: this.collectionCapabilities(res.rows.map(r => r.field))
        }
        // const fields = res.fields.map(f => ({ field: f.name, type: f.dataTypeID })).map(this.appendAdditionalRowDetails.bind(this))
        // return {
        //     id: collectionName,
        //     fields: fields as ResponseField[],
        //     capabilities: this.collectionCapabilities(res.map(f => f.Field))
        // }
    }

    private collectionCapabilities(fieldNames: string[]): CollectionCapabilities {
        return {
            dataOperations: fieldNames.includes('_id') ? ReadWriteOperations : ReadOnlyOperations,
            fieldTypes: FieldTypes,
            collectionOperations: CollectionOperations,
        }
    }

    private appendAdditionalRowDetails(row: ResponseField) {
        row.type = this.sqlSchemaTranslator.translateType(row.type)
        row.capabilities = columnCapabilitiesFor(row.type)
        return row
    }

    translateDbTypes(row: ResponseField) {
        return {
            field: row.field,
            type: this.sqlSchemaTranslator.translateType(row.type)
        }
    }
}
