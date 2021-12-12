
const fieldsWithoutSubType = (fields) => {
    return Object.entries(fields)
                 .reduce((pV, [k, v]) => {
                        const { subtype, ...rest } = v
                        return { ...pV, ...{ [k]: rest } }
                    }, {})
}

module.exports = { fieldsWithoutSubType }