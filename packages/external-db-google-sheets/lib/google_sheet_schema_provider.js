const { SystemFields, validateSystemFields, asWixSchema } = require('velo-external-db-commons')
const { translateErrorCodes } = require('./google_sheet_exception_translator')
const { reformatFields } = require('./google_sheet_utils')

class SchemaProvider {
    constructor(doc) {
        this.doc = doc
    }

    async getSheetHeader([title, spreadSheet]) {
        await spreadSheet.loadHeaderRow()
        return asWixSchema(reformatFields(spreadSheet.headerValues), title)
    }

    async getSheetsHeaders() {
        await this.doc.loadInfo()
        return await Promise.all(Object.entries(this.doc.sheetsByTitle).map(this.getSheetHeader)) 
    }

    async list() {
        const sheetHeaders = await this.getSheetsHeaders()

        return sheetHeaders

    }

    async create(sheetTitle, columns) {
        try{
            const newSheet = await this.doc.addSheet({title: sheetTitle})
            await newSheet.setHeaderRow(SystemFields.map(i => i.name))
        } catch(err){
            translateErrorCodes(err)
        }
    }

    async addColumn(collectionName, column) {
        await validateSystemFields(column.name)
        try{
            await this.doc.loadInfo()
            const sheet = await this.doc.sheetsByTitle[collectionName]
            await sheet.loadHeaderRow()
            await sheet.setHeaderRow([...sheet.headerValues, column.name])

        } catch(err){
            translateErrorCodes(err)
        }

    }
}

module.exports = SchemaProvider