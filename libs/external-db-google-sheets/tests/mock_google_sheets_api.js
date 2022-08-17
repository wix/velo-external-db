/* eslint-disable no-unused-vars */
const express = require('express')
const GoogleSpreadsheetDoc = require('./google_sheet_doc_class')
// const morgan = require('morgan')

const app = express()
const v4SpreadsheetsRouter = express.Router()
const doc = new GoogleSpreadsheetDoc('spreadsheet-doc-id', 'spreadsheet-doc-title')

// app.use(morgan())
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

    // get sheet header
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

const setHeaderToSheet = (request, sheet) => {
    const headerRow = request.body.values[0]
    const addRowsRes = sheet.addRows(headerRow, '1:1' )
    return addRowsRes
}

const updateRow = (request, sheet) => {
    const fullRange = request.body.range.split('!')[1]
    const [startRow, endRow] = fullRange.replace(/[^\d:]/g, '').split(':')
    const values = request.body.values
    const updateRowRes = sheet.updateRows(startRow, endRow, values)
    return updateRowRes
}

const batchUpdateFunctions = ( request, doc ) => {
    const requestType = Object.keys(request)[0]
    
    switch (requestType) {
        case 'addSheet':
            return addNewSheetToDoc(request, doc)
        case 'deleteRange':
            const { sheetId } = request.deleteRange.range
            const sheet = doc.getSheetById(sheetId)
            return deleteRowFromSheet(request, sheet)
        case 'deleteSheet':  
            return deleteSheetFromDoc(request, doc)
        default:
            break
    }
}

const addNewSheetToDoc = (request, doc) => {
    const newSheet = doc.addSheet(request.addSheet.properties.title)
    return { addSheet: newSheet.sheetInfo() }
}

const deleteSheetFromDoc = (request, doc) => {
    const sheetToDelete = request.deleteSheet.sheetId
    doc.deleteSheet(sheetToDelete)
    return ''
}

const deleteRowFromSheet = (request, sheet) => {
    const { startRowIndex, endRowIndex } = request.deleteRange.range
    const deleteRowsRes = sheet.deleteRows(startRowIndex, endRowIndex)
    return deleteRowsRes
}


module.exports = { app, cleanupSheets: doc.cleanupSheets }

