import { translateErrorCodes, notThrowingTranslateErrorCodes } from './sql_exception_translator'
import SchemaColumnTranslator from './sql_schema_translator'
import { escapeId, escapeTable } from './mssql_utils'
import { SystemFields, validateSystemFields, parseTableData } from '@wix-velo/velo-external-db-commons'
import { supportedOperations } from './supported_operations'
import { ConnectionPool as MSSQLPool } from 'mssql'
import { CollectionCapabilities, FieldAttributes, InputField, ISchemaProvider, ResponseField, SchemaOperations, Table } from '@wix-velo/velo-external-db-types'
import { errors } from '@wix-velo/velo-external-db-commons'
import { CollectionOperations, columnsCapabilities, EmptyCapabilities, FieldTypes, ReadOnlyOperations, ReadWriteOperations } from './mssql_capabilities'
const { CollectionDoesNotExists, CollectionAlreadyExists } = errors

export default class SchemaProvider implements ISchemaProvider {
    sql: MSSQLPool
    dbName: string
    sqlSchemaTranslator: SchemaColumnTranslator
    constructor(pool: any) {
        this.sql = pool
        this.dbName = pool.config.database

        this.sqlSchemaTranslator = new SchemaColumnTranslator()
    }

    async list(): Promise<Table[]> {
        const rs = await this.sql.request()
                                 .input('db', this.dbName)
                                 .query('SELECT TABLE_NAME as table_name, COLUMN_NAME as field, DATA_TYPE as type FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_CATALOG = @db')

        const tables: {[x:string]: {table_name: string, field: string, type: string}[]} = parseTableData(rs.recordset)
    
        return Object.entries(tables)
                     .map(([collectionName, rs]) => ({
                         id: collectionName,
                         fields: rs.map(this.appendAdditionalRowDetails.bind(this)),
                         capabilities: this.collectionCapabilities(rs.map(r => r.field))
                     }))
    }

    async listHeaders(): Promise<string[]> {
        const rs = await this.sql.request()
                                 .input('db', this.dbName)
                                 .query('SELECT TABLE_NAME as table_name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_CATALOG = @db')
        return rs.recordset.map( (rs: { table_name: any }) => rs.table_name )
    }

    supportedOperations(): SchemaOperations[] {
        return supportedOperations
    }

    async create(collectionName: string, columns: InputField[]): Promise<void> {
        const dbColumnsSql = [...SystemFields, ...(columns || [])].map( c => this.sqlSchemaTranslator.columnToDbColumnSql(c) )
                                                                       .join(', ')
        const primaryKeySql = SystemFields.filter(f => f.isPrimary).map(f => escapeId(f.name)).join(', ')
        
        await this.sql.query(`CREATE TABLE ${escapeTable(collectionName)} (${dbColumnsSql}, PRIMARY KEY (${primaryKeySql}))`)
                      .catch( (err: any) => {
                          const e = notThrowingTranslateErrorCodes(err)
                          if (!(e instanceof CollectionAlreadyExists)) {
                              throw e
                          } } )
    }

    async drop(collectionName: string): Promise<void> {
        await this.sql.query(`DROP TABLE IF EXISTS ${escapeTable(collectionName)}`)
            .catch( translateErrorCodes )
    }

    async addColumn(collectionName: string, column: InputField): Promise<void> {
        await validateSystemFields(column.name)
        await this.sql.query(`ALTER TABLE ${escapeTable(collectionName)} ADD ${escapeId(column.name)} ${this.sqlSchemaTranslator.dbTypeFor(column)}`)
                       .catch( translateErrorCodes )
    }

    async removeColumn(collectionName: string, columnName: string): Promise<void> {
        await validateSystemFields(columnName)
        await this.sql.query(`ALTER TABLE ${escapeTable(collectionName)} DROP COLUMN ${escapeId(columnName)}`)
                              .catch( translateErrorCodes )
    }

    async describeCollection(collectionName: string): Promise<Table> {
        const rs = await this.sql.request()
                                 .input('db', this.dbName)
                                 .input('tableName', collectionName)
                                 .query('SELECT TABLE_NAME as table_name, COLUMN_NAME as field, DATA_TYPE as type FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_CATALOG = @db AND TABLE_NAME = @tableName')

        if (rs.recordset.length === 0) {
            throw new CollectionDoesNotExists('Collection does not exists')
        }
        const fields = rs.recordset.map(this.appendAdditionalRowDetails.bind(this))

        return {
            id: collectionName,
            fields: fields as ResponseField[],
            capabilities: this.collectionCapabilities(fields.map((f: ResponseField) => f.field))
        }
    }
    
    async changeColumnType(collectionName: string, column: InputField): Promise<void> {
        await validateSystemFields(column.name)
        await this.sql.query(`ALTER TABLE ${escapeTable(collectionName)} ALTER COLUMN ${escapeId(column.name)} ${this.sqlSchemaTranslator.dbTypeFor(column)}`)
                      .catch(translateErrorCodes)
    }

    private appendAdditionalRowDetails(row: { field: string} & FieldAttributes): ResponseField {
        return {
            ...row,
            type: this.sqlSchemaTranslator.translateType(row.type),
            capabilities: Object.keys(columnsCapabilities).includes(row.type) ?
                columnsCapabilities[row.type as keyof typeof columnsCapabilities] : EmptyCapabilities
        }
    }

    private collectionCapabilities(fieldNames: string[]): CollectionCapabilities {
        return {
            dataOperations: fieldNames.includes('_id') ? ReadWriteOperations : ReadOnlyOperations,
            fieldTypes: FieldTypes,
            collectionOperations: CollectionOperations,
        }
    }
}
