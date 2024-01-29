import { Pool as MySqlPool } from 'mysql'
import { promisify } from 'util'
import { validateSystemFields, parseTableData, AllSchemaOperations, EmptyCapabilities } from '@wix-velo/velo-external-db-commons'
import { InputField, ISchemaProvider, ResponseField, SchemaOperations, Table, CollectionCapabilities, Encryption, PagingMode } from '@wix-velo/velo-external-db-types'
import { translateErrorCodes } from './sql_exception_translator'
import  SchemaColumnTranslator from './sql_schema_translator'
import { escapeId, escapeTable } from './mysql_utils'
import { MySqlQuery } from './types'
import { CollectionOperations, FieldTypes, ReadOnlyOperations, ReadWriteOperations, ColumnsCapabilities } from './mysql_capabilities'
import { ILogger } from '@wix-velo/external-db-logger'

export default class SchemaProvider implements ISchemaProvider {
    pool: MySqlPool
    sqlSchemaTranslator: SchemaColumnTranslator
    query: MySqlQuery
    logger?: ILogger
    constructor(pool: any, logger?: ILogger) {
        this.pool = pool
        this.logger = logger

        this.sqlSchemaTranslator = new SchemaColumnTranslator()

        this.query = promisify(this.pool.query).bind(this.pool)
    }

    async list(): Promise<Table[]> {
        const currentDb = this.pool.config.connectionConfig.database
        const sql = 'SELECT TABLE_NAME as table_name, COLUMN_NAME as field, DATA_TYPE as type FROM information_schema.columns WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME, ORDINAL_POSITION'

        this.logger?.debug('mysql-list', { sql, parameters: currentDb })

        const data = await this.query(sql, currentDb)
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
        const sql = 'SELECT TABLE_NAME as table_name FROM information_schema.tables WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME'

        this.logger?.debug('mysql-listHeaders', { sql, parameters: currentDb })
        const data = await this.query(sql, currentDb)
        return data.map( (rs: { table_name: any }) => rs.table_name )
    }

    supportedOperations(): SchemaOperations[] {
        return AllSchemaOperations
    }

    async create(collectionName: string, columns: InputField[]): Promise<void> {
        const dbColumnsSql = columns.map( c => this.sqlSchemaTranslator.columnToDbColumnSql(c) ).join(', ')
        const primaryKeySql = columns.filter(f => f.isPrimary).map(f => escapeId(f.name)).join(', ') 
        const sql = `CREATE TABLE IF NOT EXISTS ${escapeTable(collectionName)} (${dbColumnsSql}, PRIMARY KEY (${primaryKeySql}))`
        const parameters = columns.map( c => c.name )

        this.logger?.debug('mysql-create table', { sql, parameters })
        await this.query(sql, parameters)
                  .catch( err => translateErrorCodes(err, collectionName) )
    }

    async drop(collectionName: string): Promise<void> {
        const sql = `DROP TABLE IF EXISTS ${escapeTable(collectionName)}`

        this.logger?.debug('mysql-drop table', { sql })
        await this.query(`DROP TABLE IF EXISTS ${escapeTable(collectionName)}`)
                  .catch( err => translateErrorCodes(err, collectionName) )
    }

    async addColumn(collectionName: string, column: InputField): Promise<void> {
        await validateSystemFields(column.name)
        const sql = `ALTER TABLE ${escapeTable(collectionName)} ADD ${escapeId(column.name)} ${this.sqlSchemaTranslator.dbTypeFor(column)}`
        this.logger?.debug('mysql-add column', { sql })
        await this.query(`ALTER TABLE ${escapeTable(collectionName)} ADD ${escapeId(column.name)} ${this.sqlSchemaTranslator.dbTypeFor(column)}`)
                  .catch( err => translateErrorCodes(err, collectionName) )
    }

    async changeColumnType(collectionName: string, column: InputField): Promise<void> {
        await validateSystemFields(column.name)
        const sql = `ALTER TABLE ${escapeTable(collectionName)} MODIFY ${escapeId(column.name)} ${this.sqlSchemaTranslator.dbTypeFor(column)}`
        this.logger?.debug('mysql-change column type', { sql })
        await this.query(sql)
                  .catch( err => translateErrorCodes(err, collectionName) )
    }

    async removeColumn(collectionName: string, columnName: string): Promise<void> {
        await validateSystemFields(columnName)
        const sql = `ALTER TABLE ${escapeTable(collectionName)} DROP COLUMN ${escapeId(columnName)}`
        this.logger?.debug('mysql-remove column', { sql })
        return await this.query(`ALTER TABLE ${escapeTable(collectionName)} DROP COLUMN ${escapeId(columnName)}`)
                         .catch( err => translateErrorCodes(err, collectionName) )
    }

    async describeCollection(collectionName: string): Promise<Table> {
        interface describeTableResponse {
            Field: string,
            Type: string,
        }
        const sql = `DESCRIBE ${escapeTable(collectionName)}`
        this.logger?.debug('mysql-describe table', { sql })
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
