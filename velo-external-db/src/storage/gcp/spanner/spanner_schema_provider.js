const {Spanner} = require('@google-cloud/spanner')
const mysql = require('mysql2')

const SystemFields = [
    {
        name: 'id_', type: 'STRING(256)', isPrimary: true
    },
    {
        name: 'createdDate_', type: 'TIMESTAMP'
    },
    {
        name: 'updatedDate_', type: 'TIMESTAMP'
    },
    {
        name: 'owner_', type: 'STRING(256)'
    }]

class SchemaProvider {
    constructor(projectId, instanceId, databaseId) {
        this.projectId = projectId
        this.instanceId = instanceId
        this.databaseId = databaseId

        this.spanner = new Spanner({projectId: this.projectId})
        this.instance = this.spanner.instance(this.instanceId);
        this.database = this.instance.database(this.databaseId);

        this.systemFields = SystemFields
    }

    async list() {
        const query = {
            sql: 'SELECT table_name FROM information_schema.tables WHERE table_catalog = @tableCatalog and table_schema = @tableSchema',
            params: {
                tableSchema: '',
                tableCatalog: '',
            },
        };

        const [rows] = await this.database.run(query);

        return Promise.all(this.recordSetToObj(rows)
                               .map(row => row['table_name'])
                               .map( this.describeCollection.bind(this) ))
    }

    async create(collectionName, columns) {
        const dbColumns = this.systemFields.concat(columns || [])
        const dbColumnsSql = dbColumns.map( this.columnToDbColumnSql.bind(this) )
                                      .join(', ')

        const primaryKeyFieldNames = this.systemFields.filter(f => f.isPrimary).map(f => f.name)

        const request = [
            mysql.format(`CREATE TABLE ?? (${dbColumnsSql}) PRIMARY KEY (${this.wildCardWith( primaryKeyFieldNames.length, '??')})`, [collectionName, ...dbColumns.map(f => f.name), ...primaryKeyFieldNames])
        ];

        const [operation] = await this.database.updateSchema(request);


        await operation.promise();
    }

    async addColumn(collectionName, column) {
        try {
            await this.validateSystemFields(column.name)

            const request = [
                mysql.format(`ALTER TABLE ?? ADD COLUMN ${this.columnToDbColumnSql(column)}`, [collectionName, column.name])
            ];
            const [operation] = await this.database.updateSchema(request)

            await operation.promise();
        } catch (err) {
            console.log(err)
        }
  //       /*
  //       code: 'ER_NO_SUCH_TABLE',
  // errno: 1146,
  // sqlState: '42S02',
  // sqlMessage: "Table 'test-db.ew' doesn't exist"
  //        */

    }

    async removeColumn(collectionName, columnName) {
        try {
            await this.validateSystemFields(columnName)

            const request = [
                mysql.format(`ALTER TABLE ?? DROP COLUMN ??`, [collectionName, columnName])

            ];
            const [operation] = await this.database.updateSchema(request)

            await operation.promise();
        } catch (err) {
            console.log(err)
        }

        /*
        code: 'ER_CANT_DROP_FIELD_OR_KEY',
  errno: 1091,
  sqlState: '42000',
  sqlMessage: "Can't DROP 'tod'; check that column/key exists"
         */
    }

    recordSetToObj(rows) {
        return rows.map(row => row.toJSON())
    }

    async describeCollection(collectionName) {
        const query = {
            sql: 'SELECT COLUMN_NAME, SPANNER_TYPE FROM information_schema.columns WHERE table_catalog = @tableCatalog and table_schema = @tableSchema and table_name = @tableName',
            params: {
                tableSchema: '',
                tableCatalog: '',
                tableName: collectionName,
            },
        };

        const pkColumns = await this.primaryKeyColumnsFor(collectionName)

        const [rows] = await this.database.run(query);
        const res = this.recordSetToObj(rows)


        return {
            id: collectionName,
            fields: res.map(r => ({ name: r['COLUMN_NAME'], type: r['SPANNER_TYPE'], isPrimary: pkColumns.includes(r['COLUMN_NAME']) }))
        }
    }

    async primaryKeyColumnsFor(collectionName) {
        const query = {
            sql: 'SELECT COLUMN_NAME, CONSTRAINT_NAME, CONSTRAINT_SCHEMA FROM information_schema.CONSTRAINT_COLUMN_USAGE WHERE table_catalog = @tableCatalog and table_schema = @tableSchema and table_name = @tableName',
            params: {
                tableSchema: '',
                tableCatalog: '',
                tableName: collectionName,
            },
        };

        const [rows] = await this.database.run(query);
        return this.recordSetToObj(rows)
                   .filter(c => c['CONSTRAINT_NAME'].startsWith('PK_'))
                   .map(c => c['COLUMN_NAME'])
    }

    defaultForColumnType(type) {
        if (type === 'timestamp') {
            return 'NOT NULL OPTIONS (allow_commit_timestamp=true)'
        }
        return ''
    }

    columnToDbColumnSql(f) {
        return `?? ${f.type} ${this.defaultForColumnType(f.type)}`
        // return `${f.name} ${f.type} ${this.defaultForColumnType(f.type)}`
    }


    validateSystemFields(columnName) {
        if (SystemFields.find(f => f.name === columnName)) {
            return Promise.reject('ERR: system field')
        }
        return Promise.resolve()
    }

    wildCardWith(n, char) {
        return Array(n).fill(char, 0, n).join(', ')
    }

}


module.exports = {SchemaProvider, SystemFields}