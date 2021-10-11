const { errors } = require('velo-external-db-commons')

const loadSheets = async(doc) => {
    try {
        await doc.loadInfo()
    } catch (error) {
        // what to do in failure?
    }
}

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

const sheetFor = async(sheetTitle, doc) => {
    const sheet = doc.sheetsByTitle[sheetTitle]
    if (!sheet) {
        await doc.loadInfo()
    }
    if (!sheet) {
        throw new errors.CollectionDoesNotExists('Collection does not exists')
    }
    return doc.sheetsByTitle[sheetTitle]
}

const headersFrom = async(sheet) => {
    try{
        await sheet.loadHeaderRow()
        return sheet.headerValues
    } catch (e) {
        return []
    }
}

module.exports = { reformatFields, formatRow, sheetFor, headersFrom, loadSheets }
