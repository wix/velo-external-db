const { AirtableTable } = require('./air_table_table')
const chance = require('chance')()

class AirtableBase {
    constructor(id, name) {
        this.id = id
        this.name = name
        this.tables = []
    }

    tablesList() {
        return {
            tables: this.tables.map(table => table.info())
        }
    }

    getTable(tableName) {
        return this.tables.find(table => table.name === tableName)
        
    }

    createTable(tableName, columns) {
        this.tables.push(new AirtableTable(`tbl${chance.word({ length: 14 })}`, tableName))
        const table = this.getTable(tableName)
        columns.forEach(column => {
            table.addColumn(column.name,column.type)
        });
    }
}
module.exports = { AirtableBase }