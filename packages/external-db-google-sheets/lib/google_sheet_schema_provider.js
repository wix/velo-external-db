const { SystemFields, validateSystemFields } = require('velo-external-db-commons')
const { asWixSchema } = require('velo-external-db-commons')
const { translateErrorCodes } = require('./google_sheet_exception_translator')
const { headersFrom, sheetFor, reformatFields } = require('./google_sheet_utils')


class SchemaProvider {
    constructor(doc) {
        this.doc = doc
    }

    async describeSheet(sheet) {
        const headers = await headersFrom(sheet)
        return asWixSchema(reformatFields(headers), sheet._rawProperties.title)
    }

    async list() {
        await this.doc.loadInfo()
        return await Promise.all(Object.values(this.doc.sheetsByTitle)
                                                       .map( this.describeSheet ))
    }

    async create(collectionName) {
        try{
            const newSheet = await this.doc.addSheet({title: collectionName})
            await newSheet.setHeaderRow(SystemFields.map(i => i.name))
        } catch(err) {
            translateErrorCodes(err)
        }
    }

    async describeCollection(collectionName) {
        const sheet = await sheetFor(collectionName, this.doc)
        return await this.describeSheet(sheet)
    }

    async addColumn(collectionName, column) {
        await validateSystemFields(column.name)
        const sheet = await sheetFor(collectionName, this.doc)
        const header = await headersFrom(sheet)
        await sheet.setHeaderRow([ ...header, column.name])
    }
}

module.exports = SchemaProvider