const chance = require('chance')()


class AirtableTable {
    constructor(id, name) {
        this.id = id
        this.name = name
        this.data = []
        this.fields = []
        this.index = 0
    }

    info() {
        return {
            id: this.id,
            name: this.name,
            fields: this.fields,
            data: this.data
        }
    }

    insert(records) {
        const newRecords = records.map(record => { return { id: `rec${this.index++}`, ...record } })
        newRecords.forEach(element => this.data.push(element))
        return newRecords;
    }

    addColumn(name, type) {
        this.fields.push({ id: `fld${chance.word({ length: 14 })}`, name, type })
    }

    removeColumn(name) {
        this.fields = this.fields.filter(field => field.name != name)
    }

    findById(id) {
        return records.find(r => r.id === id)
    }

    getAllRows() {
        return this.data
    }

    delete(recordId) {
        const deleted = this.data.find(item => item.id == recordId)
        this.data = this.data.filter(item => item.id != recordId)
        return deleted ? true : false
    }
}
module.exports = { AirtableTable }