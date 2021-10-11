const { SystemFields } = require('velo-external-db-commons')
const { sheetFor, headersFrom } = require('./google_sheet_utils')

class DataProvider {
    constructor(doc) {
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
    
        const sheet = await sheetFor(collectionName, this.doc)
        const rows = await sheet.getRows({ offset: skip, limit })

        return rows.map(this.formatRow)
    }

    async count(collectionName) {
        const sheet = await sheetFor(collectionName, this.doc)
        return sheet._rawProperties.gridProperties.rowCount
    }

    // INSERT RELATED FUNCTIONS ////////////////////////////////////////////////////////////////////////

    async insertItemsQuery(items, sheet) {
        return items.map(async(item) => {
            const newRow = await sheet.addRow(item)
            return this.formatRow(newRow)
        })
    }

    async insert(collectionName, items) {
        const sheet = await sheetFor(collectionName, this.doc)
        return Promise.all(await this.insertItemsQuery(items, sheet))
    }
    
    // UPDATE RELATED FUNCTIONS ////////////////////////////////////////////////////////////////////////
    
    async updateRow(row, updatedItem) {
        Object.entries(updatedItem)
              .forEach(([key, value]) => row[key] = value)
        
        await row.save()
        return this.formatRow(row)
    }

    async updateItemsQuery(items, sheet) {
        return items.map( async(item) => {            
            const rowToUpdate = await this.findRowById(sheet, item._id)
            // currently content-manger using data.update to insert new items, so if the id doesn't exist it means that this is a new item
            return rowToUpdate ? await this.updateRow(rowToUpdate, item) : await this.insert(sheet.title, [item])
        })
    }

    async update(collectionName, items) {
        const item = items[0]
        const systemFieldNames = SystemFields.map(f => f.name)
        const updateFields = Object.keys(item).filter( k => !systemFieldNames.includes(k) )

        if (updateFields.length === 0) {
            return 0
        }

        const sheet = await sheetFor(collectionName, this.doc)
        return Promise.all(await this.updateItemsQuery(items, sheet))
    }

    // DELETE RELATED FUNCTIONS ////////////////////////////////////////////////////////////////////////

    async delete(collectionName, ids) {
        const sheet = await sheetFor(collectionName, this.doc)
        return ids.map(async id => {
            const rowToRemove = await this.findRowById(sheet, id)

            if(rowToRemove) {
                await rowToRemove.delete()
                return id
            }
        })
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
