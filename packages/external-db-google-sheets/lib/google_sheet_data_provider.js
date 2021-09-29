const { SystemFields } = require('velo-external-db-commons')
const { translateErrorCodes } = require('./google_sheet_exception_translator')
class DataProvider {
    constructor(doc) {
        this.doc = doc
    }

    async findRow(id, sheet){
        const rows = await sheet.getRows()
        return rows.filter(r => r._id == id)[0]
    }

    async find(collectionName, filter, sort, skip, limit){
        // const filterOperations = this.filterParser.transform(filter)
        // const sortOperations = this.filterParser.orderBy(sort)

        await this.doc.loadInfo()
        const sheet = await this.doc.sheetsByTitle[collectionName]
        const rows = await sheet.getRows({ offset: skip, limit })

        return rows.map(i => i._rawData)

    }

    async count(collectionName, filter) {
        await this.doc.loadInfo()
        const sheet = await this.doc.sheetsByTitle[collectionName]
        const rows = await sheet.getRows()
        return rows.length
    }

    async insert(collectionName, items) {
        const item = items[0]

        try{
            await this.doc.loadInfo()
            const sheet = await this.doc.sheetsByTitle[collectionName]
            const newRow = await sheet.addRow(item)

            return newRow._rawData
        } catch(err){
            translateErrorCodes(err)
        }
    }

    async update(collectionName, items) {
        const item = items[0]
        const systemFieldNames = SystemFields.map(f => f.name)
        const updateFields = Object.keys(item).filter( k => !systemFieldNames.includes(k) )

        if (updateFields.length === 0) {
            return 0
        }

        await this.doc.loadInfo()
        const sheet = await this.doc.sheetsByTitle[collectionName]
        const changedRow = await this.findRow(item._id, sheet)

        Object.entries(item).forEach( ([key, value]) => {
            changedRow[key] = value
        })

        await changedRow.save()

    }

    async delete(collectionName, itemId) {
        await this.doc.loadInfo()
        const sheet = await this.doc.sheetsByTitle[collectionName]
        const removedRow = await this.findRow(itemId, sheet)

        await removedRow.delete()
    }

    async truncate(collectionName) {
        await this.doc.loadInfo()
        const sheet = await this.doc.sheetsByTitle[collectionName]
        await sheet.loadHeaderRow()
        const sheetHeader = sheet.headerValues
        await sheet.clear()
        await sheet.setHeaderRow(sheetHeader)

    }
    
}

module.exports = DataProvider
