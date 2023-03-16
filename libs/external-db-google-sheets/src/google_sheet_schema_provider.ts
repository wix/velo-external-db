import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet'
import { CollectionCapabilities, Encryption, SchemaOperations } from '@wix-velo/velo-external-db-types'
import { SystemFields, validateSystemFields, parseTableData, errors } from '@wix-velo/velo-external-db-commons'
import { ISchemaProvider, InputField, Table } from '@wix-velo/velo-external-db-types'
import { translateErrorCodes } from './google_sheet_exception_translator'
import { describeSheetHeaders, headersFrom, sheetFor } from './google_sheet_utils'
import { CollectionOperations, FieldTypes, ReadOnlyOperations, ReadWriteOperations, ColumnsCapabilities } from './google_sheet_capabilities'

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
                         fields: rs.map(this.translateDbTypes.bind(this)),
                         capabilities: this.collectionCapabilities(rs.map(r => r.field))
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

    async describeCollection(collectionName: string): Promise<Table> {
        const sheet = await sheetFor(collectionName, this.doc)
        const fields = await describeSheetHeaders(sheet)
        return {
            id: collectionName,
            fields,
            capabilities: this.collectionCapabilities(fields.map(f => f.field)) 
        }
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

    translateDbTypes(row: { field: string, type: string }) {
        return {
            field: row.field,
            type: row.type,
            capabilities: ColumnsCapabilities[row.type as keyof typeof ColumnsCapabilities]
        }
    }

    private collectionCapabilities(fieldNames: string[]): CollectionCapabilities {
        return {
            dataOperations: fieldNames.includes('_id') ? ReadWriteOperations : ReadOnlyOperations,
            fieldTypes: FieldTypes,
            collectionOperations: CollectionOperations,
            referenceCapabilities: { supportedNamespaces: [] },
            indexing: [],
            encryption: Encryption.notSupported
        }
    }

    async changeColumnType(_collectionName: string, _column: InputField): Promise<void> {
        throw new Error('Method not implemented.')
    }
}

