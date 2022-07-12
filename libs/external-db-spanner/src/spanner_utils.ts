import { escapeId } from 'sqlstring'
import { errors } from '@wix-velo/velo-external-db-commons'
import { Spanner } from '@google-cloud/spanner'
import { Counter } from './sql_filter_transformer'
const { InvalidQuery } = errors

export { escapeId }
export const recordSetToObj = (rows: any[]) => rows.map((row:  any) => row.toJSON())

export const patchFieldName = (f: string) => {
    if (f.startsWith('_')) {
        return `x${f}`
    }
    return f
}

export const unpatchFieldName = (f: string) => {
    if (f.startsWith('x_')) {
        return f.slice(1)
    }
    return f
}

export const testLiteral = (s: string) => /^[a-zA-Z_0-9_]+$/.test(s)
export const validateLiteral = (l: any) => {
    if (!testLiteral(l)) {
        throw new InvalidQuery('Invalid literal')
    }
    return `@${l}`
}

export const validateLiteralWithCounter = (s: any, counter: Counter) => validateLiteral(`${s}${counter.valueCounter++}`)
export const nameWithCounter = (name: string, counter: Counter) => `${name}${counter.paramCounter++}`

export const escapeFieldId = (f: string) => f=== '*' ? '*' : escapeId(patchFieldName(f))


export const patchFloat = (item: { [x: string]: any }, floatFields: string | string[]) => {
    return Object.keys(item).reduce((pV, key) => (
        { ...pV, ...{ [key]: floatFields.includes(key) ? Spanner.float(item[key]) : item[key] } }
    ), {})
} 
export const extractFloatFields = (fields: any[]) => fields.filter((f: { subtype: any }) => isFloatSubtype(f.subtype)).map((f: { field: any }) => f.field)
    
const isFloatSubtype = (subtype: string) => (['float', 'double', 'decimal'].includes(subtype))
