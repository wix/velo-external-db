
const appendValuesResponse = (spreadsheetId, sheet, range, updatedRows, updatedColumns, updatedCells) => ({
    spreadsheetId: `${spreadsheetId}`,
    tableRange: `${sheet}!${range}`,
    updates: updateValuesResponse(spreadsheetId, sheet, range, updatedRows, updatedColumns, updatedCells)
})

const batchGetValuesResponse = (spreadsheetId, sheet, range, majorDimension, values) => ({
    spreadsheetId: `${spreadsheetId}`,
    valueRanges: [
      {
        range: `${sheet}!${range}`,
        majorDimension: `${majorDimension}`,
        values
      }
    ]
})

const spreadsheet = (spreadsheetId, title, sheets = []) => ({
    spreadsheetId: `${spreadsheetId}`,
    properties: {
      title: `${title}`
    },
    sheets
})

const updateValuesResponse = (spreadsheetId, sheet, range, updatedRows, updatedColumns, updatedCells) => ({
    spreadsheetId: `${spreadsheetId}`,
    updatedRange: `${sheet}!${range}`,
    updatedRows: `${updatedRows}`,
    updatedColumns: `${updatedColumns}`,
    updatedCells: `${updatedCells}`,
})


const valueRange = (sheet, range, majorDimension) => ({
    range: `${sheet}!${range}`,
    majorDimension: `${majorDimension}`,
    values: []
})

module.exports = { appendValuesResponse, batchGetValuesResponse, spreadsheet, updateValuesResponse, valueRange }


