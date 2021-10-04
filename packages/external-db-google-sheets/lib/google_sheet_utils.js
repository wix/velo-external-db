const { asWixSchema } = require('velo-external-db-commons')

const reformatFields = (headerRow) => {
    return headerRow.map(h => ({
        field: h,
        type: 'text', 
    }))
}

const formatRow = (sheetRow) => {
    return sheetRow._sheet.headerValues.reduce((obj, header, i) => {
        obj[header] = sheetRow._rawData[i]
        return obj
    }, {})
}

const updateRow = async(sheetRow, newItem) => {
    Object.entries(newItem)
          .forEach(([key, value]) => sheetRow[key] = value)
    
    await sheetRow.save()
    return sheetRow
}

const sheetFor = async(sheetTitle, doc) => {
    const sheet = doc.sheetsByTitle[sheetTitle]
    if (!sheet) {
        await doc.loadInfo()
    }
    return doc.sheetsByTitle[sheetTitle]
}

const headersFrom = async(sheet) => {
    try{
        await sheet.loadHeaderRow()
        return sheet.headerValues
    } catch (e){
        return []
    }
}

const describeSheet = async(sheet) => {
        const headers = await headersFrom(sheet)
        return asWixSchema(reformatFields(headers), sheet._rawProperties.title)
}

const findRowById = async(sheet, id) => {
    const rows = await sheet.getRows()
    return rows.find(r => r._id === id)
}

module.exports = { reformatFields, formatRow, updateRow, sheetFor, headersFrom, describeSheet, findRowById }
