
const reformatFields = (headerRow) => {
    return headerRow.map(h => ({
        field: h,
        type: 'text', 
    }))
}

module.exports = { reformatFields }
