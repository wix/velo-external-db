const { escapeId } = require('sqlstring')
const { InvalidQuery } = require('velo-external-db-commons').errors
const { Spanner } = require ('@google-cloud/spanner')

const recordSetToObj = (rows) => rows.map(row => row.toJSON())

const patchFieldName = (f) => {
    if (f.startsWith('_')) {
        return `x${f}`
    }
    return f
}

const unpatchFieldName = (f) => {
    if (f.startsWith('x_')) {
        return f.slice(1)
    }
    return f
}

const testLiteral = s => /^[a-zA-Z_0-9_]+$/.test(s)
const validateLiteral = l => {
    if (!testLiteral(l)) {
        throw new InvalidQuery('Invalid literal')
    }
    return `@${l}`
}

const escapeFieldId = f => escapeId(patchFieldName(f))

const patchFloat = (items, fields) => {
    const floatFields = extractFloatFields(fields)
    return items.map(item => patchItemFloat(item, floatFields))   
} 

const patchItemFloat = (item, floatFields) => {
    const newItem = {}
    Object.keys(item).forEach((key) => {
        newItem[key] = floatFields.includes(key) ? Spanner.float(item[key]) : item[key]
    })
    return newItem
}

const extractFloatFields = fields => ( parseFields(fields).filter(f => isFloatSubtype(f.subtype)).map(f => f.name) ) 
    
const isFloatSubtype = (subtype) => (['float', 'double', 'decimal'].includes(subtype))

const parseFields = fields => (
    Object.entries(fields).map(([name, v]) => ({ name, type: v.type, subtype: v.subtype }))
)

module.exports = { recordSetToObj, escapeId, patchFieldName, unpatchFieldName,
                    testLiteral, validateLiteral, escapeFieldId, patchItemFloat,
                    patchFloat, extractFloatFields }
