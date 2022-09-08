const { numToColumnLetter } = require('./google_sheets_test_utils')

class GoogleSpreadsheetSheet {
    constructor(sheetId, sheetTitle, sheetIndex, rowCount = 100, columnCount = 10 ) {
        this.sheetId = sheetId
        this.title = sheetTitle
        this.index = sheetIndex
        this.sheetType = 'GRID'
        this.gridProperties = { rowCount, columnCount }
        this.values = []
        this.sheetHeader = []
        this.filterViews = []
    }

    sheetInfo() {
        return {
            properties: {
                sheetId: this.sheetId,
                title: this.title,
                index: this.index,
                sheetType: this.sheetType,
                gridProperties: this.gridProperties,
                values: this.values
            },
            filterViews: this.filterViews
        }
    }

    getSheetHeader() {
        const range = `${this.title}!A1:${numToColumnLetter(this.sheetHeader.length + 1)}1`
        return { range, majorDimension: 'ROWS', values: [this.sheetHeader] }
    }

    /*
    * values - is an array with the values to be insert 
    * 1:1 - update the sheet header
    * A1 - append new row
    */

    addRows(values, range) {
        switch (range) {
            case '1:1':
                this.sheetHeader = values.filter(v => v)
                this.values[0] = this.sheetHeader 
                return { updatedData: { values: [this.sheetHeader] } }
            case 'A1':
                const startIndex = `A${this.values.length + 1}`
                this.values.push(...values)
                const endIndex = `${numToColumnLetter(values[0].length)}${this.values.length + 1}`
                return { 
                    updatedRange: `${this.title}!${startIndex}:${endIndex}`,
                    updatedData: { values: [this.sheetHeader] }
                }
            default:
                break
        }

    }

    getRows(offset, limit) {
        const rows = this.values.slice(offset-1, limit-1)
        return  { values: rows }
    }

    deleteRows(startRowIndex, endRowIndex) {
        const removedRows = this.values.slice(startRowIndex, endRowIndex)
        this.values = this.values.filter( (i, index) => (index < startRowIndex || index >= endRowIndex))
        return removedRows
    }

    updateRows(startRowIndex, endRowIndex, values) {
        this.values[startRowIndex-1] = values[0]
        return {
            updatedData: { values }
        }
    }

    clearSheet() {
        this.values = []
    }

}

module.exports = GoogleSpreadsheetSheet
