import { Pool } from 'pg'
import { SystemFields, validateSystemFields, parseTableData, AllSchemaOperations, errors } from '@wix-velo/velo-external-db-commons'
import { translateErrorCodes } from './sql_exception_translator'
import SchemaColumnTranslator from './sql_schema_translator'
import { escapeIdentifier } from './postgres_utils'
import { InputField, ISchemaProvider, ResponseField, Table } from '@wix-velo/velo-external-db-types'
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
                         fields: rs.map( this.translateDbTypes.bind(this) )
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

    async removeColumn(collectionName: string, columnName: string) {
        await validateSystemFields(columnName)

        await this.pool.query(`ALTER TABLE ${escapeIdentifier(collectionName)} DROP COLUMN ${escapeIdentifier(columnName)}`)
                         .catch( translateErrorCodes )

    }

    async describeCollection(collectionName: string): Promise<ResponseField[]> {
        const res = await this.pool.query('SELECT table_name, column_name AS field, data_type, udt_name AS type, character_maximum_length FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 ORDER BY table_name', ['public', collectionName])
                              .catch( translateErrorCodes )
        if (res.rows.length === 0) {
            throw new CollectionDoesNotExists('Collection does not exists')
        }
        return res.rows.map( this.translateDbTypes.bind(this) )
    }

    translateDbTypes(row: ResponseField) {
        return {
            field: row.field,
            type: this.sqlSchemaTranslator.translateType(row.type)
        }
    }
}
