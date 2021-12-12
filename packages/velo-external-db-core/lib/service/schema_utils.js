
const fieldsWithoutSubType = (fields) => {
    return Object.entries(fields).reduce((pV, cV) => {
        const { subtype, ...rest } = cV[1]
        return { ...pV, ...{ [cV[0]]: rest } }
    }, {})
}

module.exports = { fieldsWithoutSubType }