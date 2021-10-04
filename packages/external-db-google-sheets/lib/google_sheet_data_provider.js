const { SystemFields } = require('velo-external-db-commons')
const { translateErrorCodes } = require('./google_sheet_exception_translator')
const { sheetFor, headersFrom } = require('./google_sheet_utils')

class DataProvider {
    constructor(doc) {
        this.doc = doc
    }

    formatRow(sheetRow) {
        return sheetRow._sheet.headerValues.reduce((obj, header, i) => {
            obj[header] = sheetRow._rawData[i]
            return obj
        }, {})
    }

    async find(collectionName, filter, sort, skip, limit) {
        // const filterOperations = this.filterParser.transform(filter)
        // const sortOperations = this.filterParser.orderBy(sort)

        const sheet = await sheetFor(collectionName, this.doc)
        const rows = await sheet.getRows({ offset: skip, limit })

        return rows.map( this.formatRow )
    }

    async count(collectionName) {
        const sheet = await sheetFor(collectionName, this.doc)
        return sheet._rawProperties.gridProperties.rowCount
    }

    async insert(collectionName, items) {
        const item = items[0]

        try{
            const sheet = await sheetFor(collectionName, this.doc)
            const newRow = await sheet.addRow(item)
            return newRow._rawData
        } catch(err) {
            translateErrorCodes(err)
        }
    }

    async findRowById(sheet, id) {
        const rows = await sheet.getRows()
        return rows.find(r => r._id === id)
    }
    
    async updateRow(row, updatedItem) {
        Object.entries(updatedItem)
              .forEach(([key, value]) => row[key] = value)
        
        return await row.save()
    }

    async update(collectionName, items) {
        const item = items[0]
        const systemFieldNames = SystemFields.map(f => f.name)
        const updateFields = Object.keys(item).filter( k => !systemFieldNames.includes(k) )

        if (updateFields.length === 0) {
            return 0
        }

        const sheet = await sheetFor(collectionName, this.doc)
        const rowToUpdate = await this.findRowById(sheet, item._id)

        if (rowToUpdate) {
            return await this.updateRow(rowToUpdate, item)
        }

        return await this.insert(collectionName, items)
    }

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
