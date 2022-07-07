import { VeloRole } from "../types"

const objectContainsKey = (obj: { [x: string]: any }, key: string | number) => typeof obj[key] === 'string' && obj[key].length > 0

export const checkRequiredKeys = (obj: { [x: string]: any }, requiredKeys: any[]) => requiredKeys.filter((key: any) => !objectContainsKey(obj, key))

export const supportedDBs = ['postgres', 'spanner', 'firestore', 'mssql', 'mysql', 'mongo', 'airtable', 'dynamodb', 'bigquery', 'google-sheets']

export const supportedVendors = ['gcp', 'aws', 'azure']

const veloRoles: VeloRole[] = ['Admin', 'Member', 'Visitor'] 

export const collectionConfigPattern = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        read: { type: 'array', items: { enum: veloRoles } },
        write: { type: 'array', items: { enum: veloRoles } },
    },
    additionalProperties: false,
    required: ['id']
}

export const configPattern = {
    type: 'object',
    properties: {
        collectionPermissions: { type: 'array', items: collectionConfigPattern }
    },
    required: ['collectionPermissions']
}

export const isJson = (str: string) => { try { JSON.parse(str); return true } catch (e) { return false } }

export const jsonParser = (str: string) => {
    let parsed = JSON.parse(str)
    if (typeof parsed === 'string') parsed = jsonParser(parsed)
    return parsed
 }

 export const EmptyRoleConfig = {
    collectionPermissions: []
}