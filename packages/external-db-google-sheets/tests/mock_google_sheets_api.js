/* eslint-disable semi */
/* eslint-disable no-case-declarations */
const express = require('express')
const app = express()

app.use(express.json())

let sheetHeader = ['_id', '_createdDate', '_updatedDate', '_owner']
let sheetName = 'Sheet1'
let docProperties = {
    spreadsheetId: '18ZFGORJ8tF9pbnyb94P9Nm4VZ2WB4MoO8ZB_hqEaSgU',
    properties: {
      title: 'MySheet',
      locale: 'en_US',
      autoRecalc: 'ON_CHANGE',
      timeZone: 'Asia/Jerusalem',
      defaultFormat: {},
      spreadsheetTheme: {}
    },
    sheets: [],
    namedRanges: [],
    spreadsheetUrl: ''
}

const createDocProperties = (title) => {
    docProperties.properties.title = title
}

const createSheetProperties = (sheetTitle, rowCount, columnCount ) => ({
    properties: {
        sheetId : docProperties.sheets.length,
        title: sheetTitle,
        index: 1,
        sheetType: 'GRID',
        gridProperties: { rowCount, columnCount },
        values : [],
    },
    filterViews: [{}]
})

const updateSheetProperties = (sheetId) => {

}

const sheetHeaders = (headers) => {
    sheetHeader = headers
}

app.use((req, res, next)=>{
    console.log(req.path);
    next()
})


// get doc properties
app.get('/v4/spreadsheets/:sheetID', (req, res) => {
    res.send(docProperties)
})

// get sheet header
app.get('/v4/spreadsheets/*/values/:range', (req, res) => {
    const [sheet, range] = req.params.range.split('!')

    if (range.includes('A1:')) {
        // change the last letter in the range
        res.send({
            range: `${sheetName}!A1:AA1`,
            majorDimension: 'ROWS',
            values: [ sheetHeader ]
          })
    } else {
        res.send('not header')
    }
})

//create new Sheet  - set the name
app.post('/v4/spreadsheets/*/:requestType', (req, res) => {
    switch (req.params.requestType.split(':')[1]) {
        case 'batchUpdate':
            const requestType = Object.keys(req.body.requests[0])[0]
            sheetName = req.body.requests[0]['addSheet']['properties']['title']
            const newSheet = createSheetProperties(sheetName, 100, 6)
            docProperties.sheets.push(newSheet)
            res.send({updatedSpreadsheet: docProperties, replies: [ {[requestType]: newSheet } ]})
            break;
        case 'append':
            const [sheetTitle, range] = req.params.requestType.split('!')
            const sheet = docProperties.sheets.find(s => s.properties.title === sheetTitle.replace(/'/g, '')) 
            sheet.properties.values.push(req.body.values[0])
            console.log(sheet.properties);
            res.send({
                updates : {
                    updatedRange : `asxas!A${docProperties.sheets.length + 1}:A${docProperties.sheets.length + 1}`,
                    updatedData: {
                        sheet
                    }
            
                }})
            break;
            
        default:
            break;
    }
})


app.put('/v4/spreadsheets/*/values/:range', (req, res) => {
    const [sheetTitle, range] = req.body.range.split('!') // ;
    const sheetHeader = req.body.values[0]
    switch (range) {
        case '1:1':
            const sheet = docProperties.sheets.find(s => s.properties.title === sheetTitle.replace(/'/g, '')) 
            sheet.properties.values.push(sheetHeader)
            res.send({updatedData : sheet.properties })
            break;
    
        default:
            break;
    }
})



module.exports = app