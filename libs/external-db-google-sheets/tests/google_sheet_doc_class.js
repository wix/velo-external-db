
const GoogleSpreadsheetSheet = require('./google_sheet_sheet_class')

class GoogleSpreadsheetDoc {
    constructor(spreadsheetId, title) {
        this.spreadsheetId = spreadsheetId
        this.properties = {
            title,
        }
        this.sheets = []
        this.namedRanges = []
        this.spreadsheetUrl = 'spreadsheet-doc-url'
    }

    docInfo() {
        return {
            spreadsheetId: this.spreadsheetId,
            properties: this.properties,
            sheets: this.sheets.map(s => s.sheetInfo()),
            namedRanges: this.namedRanges,
            spreadsheetUrl: this.spreadsheetUrl,
        }
    }

    addSheet(sheetTitle) {
        const newSheet = new GoogleSpreadsheetSheet(`sheet_${this.sheets.length}_id`, sheetTitle, this.sheets.length)
        this.sheets.push(newSheet)
        return newSheet
    }

    getSheet(sheetTitle) {
        return this.sheets.find(s => sheetTitle === s.title)
    }

    getSheetById(sheetId) {
        return this.sheets.find(s => s.sheetId === sheetId)
    }

    cleanupSheets() {
        this.sheets = []
    }

    deleteSheet(sheetId) {
        this.sheets = this.sheets.filter(s => s.sheetId !== sheetId)
    }


}

module.exports = GoogleSpreadsheetDoc
