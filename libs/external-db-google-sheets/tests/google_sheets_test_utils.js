

const changeUrl = async(doc, url) => {
  doc.axios.defaults.baseURL = url
  doc.resetLocalCache()
  await doc.loadInfo()
}

const numToColumnLetter = (num) => {
  let s = '', t

  while (num > 0) {
    t = (num - 1) % 26
    s = String.fromCharCode(65 + t) + s
    num = (num - t)/26 | 0
  }
  return s || undefined
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


module.exports = { changeUrl, numToColumnLetter, addNewSheetToDoc, deleteSheetFromDoc, deleteRowFromSheet, setHeaderToSheet, updateRow, batchUpdateFunctions }