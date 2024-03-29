import { GoogleSpreadsheet, GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } from 'google-spreadsheet'
import { AdapterOperators } from '@wix-velo/velo-external-db-commons'
import { AdapterFilter, IDataProvider, Item, NotEmptyAdapterFilter } from '@wix-velo/velo-external-db-types'
import { sheetFor, headersFrom, dateFormatColumns } from './google_sheet_utils'
const { include, eq } = AdapterOperators
export default class DataProvider implements IDataProvider {
    doc: GoogleSpreadsheet
    testSupport: any

    constructor(doc: GoogleSpreadsheet, testSupport?: any) {
        this.doc = doc
        this.testSupport = testSupport
    }

    // FIND RELATED FUNCTIONS ////////////////////////////////////////////////////////////////////////

    formatRow(sheetRow: GoogleSpreadsheetRow, customProjection?: string[]) {
        const projectionArray: string[] = customProjection ? customProjection : sheetRow['_sheet'].headerValues
        return projectionArray.reduce((obj, columnName) => {
            obj[columnName] = dateFormatColumns.includes(columnName) ? new Date(sheetRow[columnName]) : sheetRow[columnName]
            return obj
        }, {} as { [key: string]: any })
    }

    async findRowById(sheet: GoogleSpreadsheetWorksheet, id: string) {
        const rows = await sheet.getRows()
        return rows.find(r => r['_id'] === id)
    }
    
    async find(collectionName: string, _filter: AdapterFilter, sort: any, skip: number, limit: number, _projection: string[]): Promise<Item[]> {        
        const sheet: GoogleSpreadsheetWorksheet = await sheetFor(collectionName, this.doc)
        const filter = _filter as NotEmptyAdapterFilter
        const projection: string[] =  this.testSupport? this.testSupport.projection(_projection) : _projection 

        if (filter && filter.operator === include && filter.fieldName === '_id') {
            const row: GoogleSpreadsheetRow | undefined = await this.findRowById(sheet, filter.value[0])
            return row !== undefined ? [this.formatRow(row, projection)] : []
        }
        
        if (filter && filter.operator === eq && filter.fieldName === '_id') {
            const row: GoogleSpreadsheetRow | undefined = await this.findRowById(sheet, filter.value)
            return row !== undefined ? [this.formatRow(row, projection)] : []
        }
        
        const rows: GoogleSpreadsheetRow[] = await sheet.getRows({ offset: skip, limit })
        return rows.map(r => this.formatRow(r, projection))
    }

    // COUNT RELATED FUNCTIONS ////////////////////////////////////////////////////////////////////////

    async count(collectionName: string, _filter: AdapterFilter): Promise<number> {
        const sheet: GoogleSpreadsheetWorksheet = await sheetFor(collectionName, this.doc)
        const filter = this.testSupport ? this.testSupport.filter(_filter) : _filter as NotEmptyAdapterFilter

        if (filter && filter.operator === eq && filter.fieldName === '_id') {
            const row: GoogleSpreadsheetRow | undefined = await this.findRowById(sheet, filter.value)
            return row !== undefined ? 1 : 0
        }

        const rows: GoogleSpreadsheetRow[] = await sheet.getRows()
        return rows.length
    }

    // INSERT RELATED FUNCTIONS ////////////////////////////////////////////////////////////////////////

    async insert(collectionName: string, items: Item[]): Promise<number> {
        const sheet: GoogleSpreadsheetWorksheet = await sheetFor(collectionName, this.doc)
        await sheet.addRows(items)        
        return items.length
    }
    
    // UPDATE RELATED FUNCTIONS ////////////////////////////////////////////////////////////////////////

    async updateRow(row: GoogleSpreadsheetRow, updatedItem: Item) {
        Object.entries(updatedItem).forEach(([key, value]) => row[key] = value)
        await row.save()
    }

    async update(collectionName: string, items: Item[]): Promise<number> {
        const sheet: GoogleSpreadsheetWorksheet = await sheetFor(collectionName, this.doc)
        const itemsToUpdate = items.slice(0, 3) // google-sheets API can update only 3 items at the same time

        const updatePromises = await Promise.all(
            itemsToUpdate.map( async(item) => {
                const rowToUpdate = await this.findRowById(sheet, item['_id'] as string)
                if (rowToUpdate) {
                    return await this.updateRow(rowToUpdate, item)
                }
            })
        )

        return updatePromises.length
    }

    async bulkUpdate(collectionName: string, items: Item[]) {
        await this.update(collectionName, items)
    }

    // DELETE RELATED FUNCTIONS ////////////////////////////////////////////////////////////////////////
    
    async delete(collectionName: string, ids: string[]): Promise<number> {
        const sheet: GoogleSpreadsheetWorksheet = await sheetFor(collectionName, this.doc)
        const idsToRemove = ids.slice(0, 3) // google-sheets API can update till 3 items at the same time

        const removePromises = Promise.all(idsToRemove.map(async id => this.deleteRow(sheet, id)))

        return (await removePromises).length
    }

    async deleteRow(sheet: GoogleSpreadsheetWorksheet, id: string) {
        const rowToDelete = await this.findRowById(sheet, id) as GoogleSpreadsheetRow
        await rowToDelete.delete()
    }

    async truncate(collectionName: string) {
        const sheet: GoogleSpreadsheetWorksheet = await sheetFor(collectionName, this.doc)
        const sheetHeader = await headersFrom(sheet)
        await sheet.clear()

        if (sheetHeader.length > 0) {
            await sheet.setHeaderRow(sheetHeader)
        }
    }
    
}


