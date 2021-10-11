/* eslint-disable no-case-declarations */
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
            properties : {
                sheetId : this.sheetId,
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
        return {range, majorDimension: 'ROWS', values: [this.sheetHeader]}
    }

    addRows(values, range) {
        switch (range) {
            case '1:1':
                this.sheetHeader = values.filter(v => v)
                this.values[0] = this.sheetHeader 
                return {updatedData: { values: [this.sheetHeader]}}
            case 'A1':
                this.values.push(values)
                const startIndex = `A${this.values.length}`
                const endIndex = `${numToColumnLetter(values.length)}${this.values.length}`
                return { 
                    updatedRange: `${this.title}!${startIndex}:${endIndex}`,
                    updatedData: { values: [this.sheetHeader]}
                }
            default:
                break;
        }

    }

    getRows(offset, limit) {
        const rows = this.values.slice(offset-1, limit-1)
        return  { values: rows}
    }

}

module.exports = GoogleSpreadsheetSheet
