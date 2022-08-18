const express = require('express')
const GoogleSpreadsheetDoc = require('./google_sheet_doc_class')
const { setHeaderToSheet, updateRow, batchUpdateFunctions } = require('./google_sheets_test_utils')


const app = express()
const v4SpreadsheetsRouter = express.Router()
const doc = new GoogleSpreadsheetDoc('spreadsheet-doc-id', 'spreadsheet-doc-title')

app.use(express.json())
app.use('/v4/spreadsheets/', v4SpreadsheetsRouter)

// DOC INFO ROUTES
v4SpreadsheetsRouter.get('/:sheetId/', (_, res) => {
    res.send(doc.docInfo())
})


// get sheet values ( first row is header )
v4SpreadsheetsRouter.get('/:sheetId/values/:sheetName_range', (req, res) => {
    const sheetTitle =req.params.sheetName_range.split('!')[0].replace(/^'/, '').replace(/'$/, '')
    const range = req.params.sheetName_range.split('!')[1]

    const sheet = doc.getSheet(sheetTitle)

    // GET SHEET HEADER
    if (range.includes('A1:')) {
        return res.send(sheet.getSheetHeader())
    }

    const [, startIndex, endIndex] = range.match(/[A-Z]+([0-9]+):[A-Z]+([0-9]+)/)
    const getRowsRes = sheet.getRows(parseInt(startIndex), parseInt(endIndex))
    res.send(getRowsRes)
})

v4SpreadsheetsRouter.post('/:sheetId/(:batchUpdate)/', (req, res) => {
    const requests = req.body.requests
    const replies = requests.map(r => batchUpdateFunctions(r, doc))
    res.send({ updatedSpreadsheet: doc.docInfo(), replies })
})

v4SpreadsheetsRouter.post('/:sheetId/values/:sheet_range_requestType', (req, res) => {
    const [sheetTitle_range, requestType] = req.params.sheet_range_requestType.split(':')
    const sheetTitle = sheetTitle_range.split('!')[0].replace(/^'/, '').replace(/'$/, '')
    const range = sheetTitle_range.split('!')[1]
    const values = req.body.values

    switch (requestType) {
        case 'append': {
            const sheet = doc.getSheet(sheetTitle)
            const addRowsRes = sheet.addRows(values, range)
            return res.send({ updates: addRowsRes })
        }
        case 'clear': {
            const sheet = doc.getSheet(sheetTitle)
            const clearSheetRes = sheet.clearSheet()
            return res.send({ updates: clearSheetRes })
        }
    }
      
})

v4SpreadsheetsRouter.put('/:sheetId/values/:sheetName_range', (req, res) => {
    const sheetTitle = req.body.range.split('!')[0].replace(/^'/, '').replace(/'$/, '')
    const range = req.body.range.split('!')[1]

    const sheet = doc.getSheet(sheetTitle)

    const actionRes = range === '1:1' ? setHeaderToSheet(req, sheet) : updateRow(req, sheet)

    res.send(actionRes)
})



module.exports = { app, cleanupSheets: doc.cleanupSheets }

