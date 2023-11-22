import { Pool as MySqlPool } from 'mysql'
import { promisify } from 'util'
import { validateSystemFields, parseTableData, AllSchemaOperations, EmptyCapabilities } from '@wix-velo/velo-external-db-commons'
import { InputField, ISchemaProvider, ResponseField, SchemaOperations, Table, CollectionCapabilities, Encryption, PagingMode } from '@wix-velo/velo-external-db-types'
import { translateErrorCodes } from './sql_exception_translator'
import  SchemaColumnTranslator from './sql_schema_translator'
import { escapeId, escapeTable } from './mysql_utils'
import { MySqlQuery } from './types'
import { CollectionOperations, FieldTypes, ReadOnlyOperations, ReadWriteOperations, ColumnsCapabilities } from './mysql_capabilities'

export default class SchemaProvider implements ISchemaProvider {
    pool: MySqlPool
    sqlSchemaTranslator: SchemaColumnTranslator
    query: MySqlQuery
    constructor(pool: any) {
        this.pool = pool

        this.sqlSchemaTranslator = new SchemaColumnTranslator()

        this.query = promisify(this.pool.query).bind(this.pool)
    }

    async list(): Promise<Table[]> {
        const currentDb = this.pool.config.connectionConfig.database
        const data = await this.query('SELECT TABLE_NAME as table_name, COLUMN_NAME as field, DATA_TYPE as type FROM information_schema.columns WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME, ORDINAL_POSITION', currentDb)
        const tables: {[x:string]: { field: string, type: string}[]} = parseTableData( data )

        return Object.entries(tables)
                     .map(([collectionName, rs]) => ({
                         id: collectionName,
                         fields: rs.map(this.appendAdditionalRowDetails.bind(this)),
                         capabilities: this.collectionCapabilities(rs.map(r => r.field))
                     } ))
    }

    async listHeaders(): Promise<string[]> {
        const currentDb = this.pool.config.connectionConfig.database
        const data = await this.query('SELECT TABLE_NAME as table_name FROM information_schema.tables WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME', currentDb)
        return data.map( (rs: { table_name: any }) => rs.table_name )
    }

    supportedOperations(): SchemaOperations[] {
        return AllSchemaOperations
    }

    async create(collectionName: string, columns: InputField[]): Promise<void> {
        const dbColumnsSql = (columns || []).map( c => this.sqlSchemaTranslator.columnToDbColumnSql(c) ).join(', ')
        const primaryKeySql = '_id'

        await this.query(`CREATE TABLE IF NOT EXISTS ${escapeTable(collectionName)} (${dbColumnsSql}, PRIMARY KEY (${primaryKeySql}))`,
                         [...(columns || []).map((c: { name: any }) => c.name)])
                  .catch( err => translateErrorCodes(err, collectionName) )
    }

    async drop(collectionName: string): Promise<void> {
        await this.query(`DROP TABLE IF EXISTS ${escapeTable(collectionName)}`)
                  .catch( err => translateErrorCodes(err, collectionName) )
    }

    async addColumn(collectionName: string, column: InputField): Promise<void> {
        await validateSystemFields(column.name)
        await this.query(`ALTER TABLE ${escapeTable(collectionName)} ADD ${escapeId(column.name)} ${this.sqlSchemaTranslator.dbTypeFor(column)}`)
                  .catch( err => translateErrorCodes(err, collectionName) )
    }

    async changeColumnType(collectionName: string, column: InputField): Promise<void> {
        await validateSystemFields(column.name)
        await this.query(`ALTER TABLE ${escapeTable(collectionName)} MODIFY ${escapeId(column.name)} ${this.sqlSchemaTranslator.dbTypeFor(column)}`)
                  .catch( err => translateErrorCodes(err, collectionName) )
    }

    async removeColumn(collectionName: string, columnName: string): Promise<void> {
        await validateSystemFields(columnName)
        return await this.query(`ALTER TABLE ${escapeTable(collectionName)} DROP COLUMN ${escapeId(columnName)}`)
                         .catch( err => translateErrorCodes(err, collectionName) )
    }

    async describeCollection(collectionName: string): Promise<Table> {
        interface describeTableResponse {
            Field: string,
            Type: string,
        }
        
        const res: describeTableResponse[] = await this.query(`DESCRIBE ${escapeTable(collectionName)}`)
                                                       .catch( err => translateErrorCodes(err, collectionName) )
        const fields = res.map(r => ({ field: r.Field, type: r.Type })).map(this.appendAdditionalRowDetails.bind(this))
        return {
            id: collectionName,
            fields: fields as ResponseField[],
            capabilities: this.collectionCapabilities(res.map(f => f.Field))
        }
    }

    private appendAdditionalRowDetails(row: {field: string, type: string}) : ResponseField {        
        const type = this.sqlSchemaTranslator.translateType(row.type) as keyof typeof ColumnsCapabilities
        return {
            field: row.field,
            type,
            capabilities: ColumnsCapabilities[type] ?? EmptyCapabilities
        }
    }

    private collectionCapabilities(fieldNames: string[]): CollectionCapabilities {
        return {
            dataOperations: fieldNames.includes('_id') ? ReadWriteOperations : ReadOnlyOperations,
            fieldTypes: FieldTypes,
            collectionOperations: CollectionOperations,
            referenceCapabilities: { supportedNamespaces: [] },
            indexing: [],
            encryption: Encryption.notSupported,
            pagingMode: PagingMode.offset
        }
    }
}
