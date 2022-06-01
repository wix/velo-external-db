const { errors } = require('@wix-velo/velo-external-db-commons')

const loadSheets = async(doc) => {
    try {
        await doc.loadInfo()
    } catch (error) {
        // what to do in failure?
    }
}

const describeSheetHeaders = async(sheet) => {
    const headers = await headersFrom(sheet)
    return headers.map(h => ({
        table_name: sheet._rawProperties.title,
        field: h,
        type: (h === '_createdDate' || h === '_updatedDate') ?  'datetime' : 'text',
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

const findRowById = async(sheet, id) => {
    const rows = await sheet.getRows()
    return rows.find(r => r._id === id)
}

const getRows= async(sheet, filter, offset, limit) => {
    switch (filter.operator) {
        case '$eq':
            const rows = await sheet.getRows()
            return rows.filter(r => r[filter.fieldName] === filter.value)        
        default:
            return await sheet.getRows({ offset, limit })
    }
}

module.exports = { formatRow, sheetFor, headersFrom, loadSheets, findRowById, getRows, describeSheetHeaders }
