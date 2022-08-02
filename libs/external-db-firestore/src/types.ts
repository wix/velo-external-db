import { WhereFilterOp } from '@google-cloud/firestore'

export type firestoreConfig = {
    projectId: string
}

export type table = {
    table_name: string,
    fields: string,
    type: string,
}


export type queryFilter = { fieldName: string, opStr: WhereFilterOp, value: any }
