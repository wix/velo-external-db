import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet'
import { SchemaOperations } from '@wix-velo/velo-external-db-types'
import { SystemFields, validateSystemFields, parseTableData, errors } from '@wix-velo/velo-external-db-commons'
import { ISchemaProvider, ResponseField, InputField, Table } from '@wix-velo/velo-external-db-types'
import { translateErrorCodes } from './google_sheet_exception_translator'
import { describeSheetHeaders, headersFrom, sheetFor } from './google_sheet_utils'

export default class SchemaProvider implements ISchemaProvider {
    doc: GoogleSpreadsheet

    constructor(doc: GoogleSpreadsheet) {
        this.doc = doc
    }

    async sheetsHeaders(sheets: GoogleSpreadsheetWorksheet[]) {
        const describedSheets = await Promise.all(sheets.map(describeSheetHeaders))
        return describedSheets.flatMap(s => s)
    }

    async list() : Promise<Table[]> {
        await this.doc.loadInfo()
        const sheets = Object.values(this.doc.sheetsByTitle)
        const sheetsHeaders = await this.sheetsHeaders(sheets)
        const parsedSheetsHeadersData: {[x:string]: {table_name: string, field: string, type: string}[]}  = parseTableData(sheetsHeaders) 
        return Object.entries(parsedSheetsHeadersData)
                     .map(([collectionName, rs]) => ({
                         id: collectionName,
                         fields: rs.map(this.translateDbTypes.bind(this))
                     }))
    }

    async listHeaders() {
        await this.doc.loadInfo()
        return Object.keys(this.doc.sheetsByTitle)
    }

    supportedOperations() {
        const { List, ListHeaders, Create, Drop, AddColumn, Describe } = SchemaOperations
        return [ List, ListHeaders, Create, Drop, AddColumn, Describe ]
    }

    async create(collectionName: string, columns: InputField[]) {
        try {
            const headerValues = columns? [...SystemFields.map(i => i.name), ...columns.map(i => i.name)] : [...SystemFields.map(i => i.name)]
            await this.doc.addSheet({ title: collectionName, headerValues })
        } catch (error) {
            return      
        }
    }

    async describeCollection(collectionName: string) {
        const sheet = await sheetFor(collectionName, this.doc)
        return await describeSheetHeaders(sheet)
    }

    async addColumn(collectionName: string, column: InputField) {
        await validateSystemFields(column.name)
        const sheet = await sheetFor(collectionName, this.doc)
        const headers = await headersFrom(sheet)

        if (headers.includes(column.name)) {
            throw new errors.FieldAlreadyExists('Field already exists')
        }

        await sheet.setHeaderRow([ ...headers, column.name]).catch(translateErrorCodes)
    }

    async removeColumn() {
        throw new errors.InvalidRequest('Columns in Google Sheets cannot be deleted')
    }

    async drop(collectionName: string) {
        const sheet: GoogleSpreadsheetWorksheet = await sheetFor(collectionName, this.doc)
        await sheet.delete()
    }

    translateDbTypes(row: ResponseField) {
        return {
            field: row.field,
            type: row.type
        }
    }
}

