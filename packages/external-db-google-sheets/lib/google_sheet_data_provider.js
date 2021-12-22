const { sheetFor, headersFrom, findRowById } = require('./google_sheet_utils')

class DataProvider {
    constructor(doc, filterParser) {
        this.filterParser = filterParser
        this.doc = doc
    }

    formatRow(sheetRow) {
        return sheetRow._sheet.headerValues.reduce((obj, header, i) => {
            obj[header] = (header === '_updatedDate' || header === '_createdDate') ? new Date(sheetRow._rawData[i]) : sheetRow._rawData[i]
            return obj
        }, {})
    }

    async findRowById(sheet, id) {
        const rows = await sheet.getRows()
        return rows.find(r => r._id === id)
    }
    
    async find(collectionName, filter, sort, skip, limit) {
        const { filterExpr, fieldName, parameter } = this.filterParser.transform(filter)
        const sheet = await sheetFor(collectionName, this.doc)

        if (filterExpr === '$eq' && fieldName === '_id') {
            const row = await findRowById(sheet, parameter)
            return row !== undefined ? [this.formatRow(row)] : []
        }

        const rows = await sheet.getRows({ offset: skip, limit })
        return rows.map(this.formatRow)
    }

    async count(collectionName, filter) {
        const rows = await this.find(collectionName, filter)
        return rows.length
    }

    // INSERT RELATED FUNCTIONS ////////////////////////////////////////////////////////////////////////

    async insert(collectionName, items) {
        const sheet = await sheetFor(collectionName, this.doc)
        const rows = await sheet.addRows(items)
        return rows.map(this.formatRow) 
    }
    
    // UPDATE RELATED FUNCTIONS ////////////////////////////////////////////////////////////////////////

    async updateRow(row, updatedItem) {
        Object.entries(updatedItem)
              .forEach(([key, value]) => row[key] = value)
        
        await row.save()
        return this.formatRow(row)
    }

    async update(collectionName, items) {
        const sheet = await sheetFor(collectionName, this.doc)
        return await Promise.all(items.slice(0, 3).map(async item => {
            const rowToUpdate = await this.findRowById(sheet, item._id)
            
            // currently content-manger using data.update to insert new items, so if the id doesn't exist it means that this is a new item
            return rowToUpdate ? await this.updateRow(rowToUpdate, item) : await this.insert(collectionName, [item])
        }))
    }

    async bulkUpdate(collectionName, items) {
        await this.update(collectionName, items)
    }

    // DELETE RELATED FUNCTIONS ////////////////////////////////////////////////////////////////////////
    
    async delete(collectionName, ids) {
        const sheet = await sheetFor(collectionName, this.doc)
        await Promise.all(ids.slice(0, 3).map(async id => this.deleteRow(sheet, id)))
        return {}
    }

    async deleteRow(sheet, id) {
        const rowToDelete = await this.findRowById(sheet, id)
        await rowToDelete.delete()
    }

    async truncate(collectionName) {
        const sheet = await sheetFor(collectionName, this.doc)
        const sheetHeader = await headersFrom(sheet)
        await sheet.clear()

        if (sheetHeader.length > 0) {
            await sheet.setHeaderRow(sheetHeader)
        }
    }
    
}

module.exports = DataProvider
