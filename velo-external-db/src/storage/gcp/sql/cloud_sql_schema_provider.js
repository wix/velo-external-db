
const SystemFields = [
    {
        name: '_id', type: 'varchar(256)', isPrimary: true
    },
    {
        name: '_createdDate', type: 'timestamp'
    },
    {
        name: '_updatedDate', type: 'timestamp'
    },
    {
        name: '_owner', type: 'varchar(256)'
    }]

class SchemaProvider {
    constructor(pool) {
        this.pool = pool

        this.systemFields = SystemFields
    }

    async list() {
        /*
{
    displayName: table.table,
    id: table.table,
    allowedOperations: allowedOperations,
    maxPageSize: 50,
    ttl: 3600,
    fields: convertFields(table.columns)
  }

{
        displayName: field.name,
        type: extractFieldType(field.type),


const extractFieldType = dbType => {
  const type = dbType
    .toLowerCase()
    .split('(')
    .shift()

  switch (type) {
    case 'varchar':
    case 'text':
      return 'text'
    case 'decimal':
    case 'bigint':
    case 'int':
      return 'number'
    case 'tinyint':
      return 'boolean'
    case 'date':
    case 'datetime':
    case 'time':
      return 'datetime'
    case 'json':
    default:
      return 'object'
  }
}

         */
        const tables = await this.pool.query('SHOW TABLES')
        const columnName = tables[1][0].name

        return Promise.all(tables[0].map(r => r[columnName])
                                    .map( this.describeCollection.bind(this) ))
    }

    async describeCollection(collectionName) {
        const res = await this.pool.query('DESCRIBE ??', [collectionName])
        return {
            id: collectionName,
            fields: res[0].map(r => ({ name: r.Field, type: r.Type, isPrimary: r.Key === 'PRI' }))
        }
    }

    defaultForColumnType(type) {
        if (type === 'timestamp') {
            return 'DEFAULT CURRENT_TIMESTAMP'
        }
        return ''
    }

    async create(collectionName, columns) {
        await this.pool.query(`CREATE TABLE IF NOT EXISTS ?? (${this.systemFields.map(f => `${f.name} ${f.type} ${this.defaultForColumnType(f.type)}`).join(', ')}, PRIMARY KEY (${this.systemFields.filter(f => f.isPrimary).map(f => `\`${f.name}\``).join(', ')}))`, [collectionName])
    }

    async addColumn(collectionName, column) {
        if (SystemFields.find(f => f.name === column.name)) {
            console.log(`System field: [${column.name}]`)
            return Promise.resolve()
        }
            console.log(SystemFields.find(f => f.name === column))
        return await this.pool.query(`ALTER TABLE ?? ADD ?? ${column.type}`, [collectionName, column.name])
                              .catch(err => console.log(err))
        /*
        code: 'ER_NO_SUCH_TABLE',
  errno: 1146,
  sqlState: '42S02',
  sqlMessage: "Table 'test-db.ew' doesn't exist"
         */

    }

    async removeColumn(collectionName, columnName) {
        if (SystemFields.find(f => f.name === columnName)) {
            console.log(`System field: [${columnName}]`)
            return Promise.resolve()
        }

        return await this.pool.query(`ALTER TABLE ?? DROP COLUMN ??`, [collectionName, columnName])
                              .catch(err => console.log(err))

        /*
        code: 'ER_CANT_DROP_FIELD_OR_KEY',
  errno: 1091,
  sqlState: '42000',
  sqlMessage: "Can't DROP 'tod'; check that column/key exists"
         */
    }


}

module.exports = {SchemaProvider, SystemFields}