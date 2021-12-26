const { SystemFields, validateSystemFields, parseTableData, errors, SchemaOperations } = require('velo-external-db-commons')
const { translateErrorCodes } = require('./google_sheet_exception_translator')
const { describeSheetHeaders, headersFrom, sheetFor } = require('./google_sheet_utils')

const { LIST, LIST_HEADERS, CREATE, DROP, ADD_COLUMN, DESCRIBE_COLLECTION } = SchemaOperations
const schemaSupportedOperations =  [LIST, LIST_HEADERS, CREATE, DROP, ADD_COLUMN, DESCRIBE_COLLECTION]
class SchemaProvider {
    constructor(doc) {
        this.doc = doc
    }

    async sheetsHeaders(sheets) {
        const describedSheets = await Promise.all(sheets.map(describeSheetHeaders))
        return describedSheets.flatMap(s => s)
    }

    async list() {
        await this.doc.loadInfo()
        const sheets = Object.values(this.doc.sheetsByTitle)
        const sheetsHeaders = await this.sheetsHeaders(sheets)
        const parsedSheetsHeadersData = parseTableData(sheetsHeaders)
        return Object.entries(parsedSheetsHeadersData)
                     .map(([collectionName, rs]) => ({
                         id: collectionName,
                         fields: rs.map(this.translateDbTypes.bind(this))
                     }))
    }

    async listHeaders() {
        await this.doc.loadInfo()
        const sheets = await Promise.all( Object.values(this.doc.sheetsByTitle) )
        return sheets.map(sheet => sheet._rawProperties.title)
    }

    supportedOperations() {
        return schemaSupportedOperations
    }

    async create(collectionName) {
        const newSheet = await this.doc.addSheet({ title: collectionName })
        await newSheet.setHeaderRow(SystemFields.map(i => i.name))
                      .catch(translateErrorCodes)
    }

    async describeCollection(collectionName) {
        const sheet = await sheetFor(collectionName, this.doc)
        return await describeSheetHeaders(sheet)
    }

    async addColumn(collectionName, column) {
        await validateSystemFields(column.name)
        const sheet = await sheetFor(collectionName, this.doc)
        const header = await headersFrom(sheet)
        await sheet.setHeaderRow([ ...header, column.name])
                   .catch(translateErrorCodes)
    }

    async removeColumn() {
        throw new errors.InvalidRequest('Columns in Google Sheets cannot be deleted')
    }

    async drop(collectionName) {
        const sheet = await sheetFor(collectionName, this.doc)
        await sheet.delete()
    }

    translateDbTypes(row) {
        return {
            field: row.field,
            type: row.type
        }
    }
}

module.exports = { SchemaProvider, schemaSupportedOperations }