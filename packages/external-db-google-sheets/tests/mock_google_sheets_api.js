/* eslint-disable semi */
/* eslint-disable no-case-declarations */
const express = require('express')
const GoogleSpreadsheetDoc = require('./google_sheet_doc_class')

const app = express()
const v4SpreadsheetsRouter = express.Router();
const doc = new GoogleSpreadsheetDoc('spreadsheet-doc-id', 'spreadsheet-doc-title')

app.use(express.json())
app.use('/v4/spreadsheets/', v4SpreadsheetsRouter);

// remove in the end
app.use((req, res, next)=>{
    console.log(JSON.stringify({method: req.method, path: req.path}));
    next()
})

v4SpreadsheetsRouter.get('/:sheetId/', (_, res) =>{
    res.send(doc.docInfo())
})

// get sheet header
v4SpreadsheetsRouter.get('/:sheetId/values/:range', (req, res) => {
    const [sheetTitle, range] = req.params.range.split('!')
    const sheet = doc.getSheet(sheetTitle.replace(/^'/, '').replace(/'$/, ''))
    if (range.includes('A1:')) {
        res.send(sheet.getSheetHeader());
    } else {
        const [_, startIndex, endIndex] = range.match(/[A-Z]+([0-9]+):[A-Z]+([0-9]+)/)
        const getRowsRes = sheet.getRows(parseInt(startIndex), parseInt(endIndex))
        res.send(getRowsRes)
    }
})

v4SpreadsheetsRouter.post('/:sheetId/:requestType',(req,res) => {
    let replies 
    switch (req.params.requestType.split(':')[1]) {
        case 'batchUpdate':
            replies = req.body.requests.map(r => batchUpdateFunctions(r, doc) )
            break;
    }
    res.send({'updatedSpreadsheet': doc.docInfo(), replies })
})

v4SpreadsheetsRouter.post('/:sheetId/values/:sheet_range_requestType', (req, res) => {
    const [sheetTitle_range, requestType] = req.params.sheet_range_requestType.split(':')
    const [sheetTitle, range] = sheetTitle_range.split('!')
    const sheet = doc.getSheet(sheetTitle.replace(/^'/, '').replace(/'$/, ''))
    const addRowsRes = sheet.addRows(req.body.values[0], range )
    
    res.send({updates: addRowsRes})
})

v4SpreadsheetsRouter.put('/:sheetId/values/:requestType', (req, res) => {
    const [sheetTitle, range] = req.body.range.split('!')
    const sheet = doc.getSheet(sheetTitle.replace(/^'/, '').replace(/'$/, ''))
    const addRowsRes = sheet.addRows(req.body.values[0], range )
    res.send(addRowsRes)
})

const batchUpdateFunctions = ( request, doc ) => {
    const requestType = Object.keys(request)[0]
    switch (requestType) {
        case 'addSheet':
            const newSheet = doc.addSheet(request.addSheet.properties.title)
            return {'addSheet': newSheet.sheetInfo() }
        default:
            break;
    }
}



module.exports = { app, cleanupSheets : doc.cleanupSheets }