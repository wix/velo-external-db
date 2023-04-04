import { GoogleSpreadsheet, GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } from 'google-spreadsheet'
import { AdapterOperators } from '@wix-velo/velo-external-db-commons'
import { AdapterFilter, IDataProvider, Item, NotEmptyAdapterFilter } from '@wix-velo/velo-external-db-types'
import { sheetFor, headersFrom, dateFormatColumns } from './google_sheet_utils'
const { include, eq } = AdapterOperators

interface State {
    [sheetName: string]: StateItem
}

interface StateItem {
    rows: Promise<GoogleSpreadsheetRow[]>,
    timestamp: number
}


export default class DataProvider implements IDataProvider {
    doc: GoogleSpreadsheet
    testSupport: any
    state: State
    // Standard time to live in seconds.
    stdTTL: number
    // Time in seconds to check all data and delete expired keys
    checkPeriod: number

    constructor(doc: GoogleSpreadsheet, testSupport?: any, stdTTL = 15, checkPeriod = 60) {
        this.doc = doc
        this.testSupport = testSupport
        this.state = {}
        this.stdTTL = stdTTL
        this.checkPeriod = checkPeriod
        setInterval(this.checkAndClearState.bind(this), checkPeriod * 1000)
    }

    // STATE RELATED FUNCTIONS ////////////////////////////////////////////////////////////////////////

    private isOlderThanStdTTL(timestamp: number) {
        return (Date.now() - timestamp) > this.stdTTL * 1000
    }

    clearCollectionFromState(key: string) {
        delete this.state[key]
    }

    private checkAndClearState() {  
        const keys = Object.keys(this.state)
        keys.forEach(key => {
            if (this.isOlderThanStdTTL(this.state[key].timestamp)) {
                this.clearCollectionFromState(key)
            }
        })
    }

    private async insertItemToStateCollection(sheetName: string, _items: GoogleSpreadsheetRow[]) {
        
        // If sheet is in cache, add the new items to the existing ones
        if (this.state[sheetName]) {
            this.state[sheetName].rows = Promise.resolve([...await this.state[sheetName].rows, ..._items])
        }
    }

    private async updateItemInStateCollection(sheetName: string, _item: GoogleSpreadsheetRow) {
        // If sheet is in cache, update the item
        if(this.state[sheetName]) {
            const rows = await this.state[sheetName].rows
            const index = rows.findIndex(row => row['_id'] === _item['_id'])
            rows[index] = _item
            this.state[sheetName].rows = Promise.resolve(rows)
        }
    }

    private async deleteItemFromStateCollection(sheetName: string, id: string) {        
        // If sheet is in cache, delete the item
        if(this.state[sheetName]) {
            const rows = await this.state[sheetName].rows
            const rowsAfterDeletion = rows.filter(row => row['_id'] !== id)
            this.state[sheetName].rows = Promise.resolve(rowsAfterDeletion)
        }

    }

    private async rowsFor(sheet: GoogleSpreadsheetWorksheet, options?: any) {
        
        // Sheet is not in cache
        if (!this.state[sheet.title]) {
            this.state[sheet.title] = {
                rows: sheet.getRows(options),
                timestamp: Date.now()
            }

            return this.state[sheet.title].rows
        }

        // Sheet is in cache but is older than stdTTL
        if(this.isOlderThanStdTTL(this.state[sheet.title].timestamp)) {
            this.state[sheet.title] = {
                rows: sheet.getRows(options),
                timestamp: Date.now()
            }
            return this.state[sheet.title].rows
        }

        return this.state[sheet.title].rows
    
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
        const rows = await this.rowsFor(sheet)
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
        
        const rows: GoogleSpreadsheetRow[] = await this.rowsFor(sheet, { offset: skip, limit })
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

        const rows: GoogleSpreadsheetRow[] = await this.rowsFor(sheet)
        return rows.length
    }

    // INSERT RELATED FUNCTIONS ////////////////////////////////////////////////////////////////////////

    async insert(collectionName: string, items: Item[]): Promise<number> {
        const sheet: GoogleSpreadsheetWorksheet = await sheetFor(collectionName, this.doc)
        const res = await sheet.addRows(items)   
        await this.insertItemToStateCollection(sheet.title, res)     
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
                    await this.updateRow(rowToUpdate, item)
                    await this.updateItemInStateCollection(sheet.title, rowToUpdate)
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

        const removePromises = Promise.all(idsToRemove.map(async id => {
            this.deleteRow(sheet, id).then(_i => this.deleteItemFromStateCollection(sheet.title, id))
        }))

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


