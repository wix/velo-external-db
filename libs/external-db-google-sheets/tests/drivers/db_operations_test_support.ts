import { GoogleSpreadsheet } from 'google-spreadsheet'
import * as serviceAccountKey from '../e2e-testkit/service_account_key.json'
import { SHEET_ID } from '../e2e-testkit/google_sheets_resources'
import DatabaseOperations from '../../src/google_sheet_operations'

const createPool =  () => {
    const googleSheetDoc = new GoogleSpreadsheet(SHEET_ID)

    googleSheetDoc.useServiceAccountAuth({
        client_email: serviceAccountKey.client_email,
        private_key: serviceAccountKey.private_key
    })

    return googleSheetDoc
}

const dbOperationWithMisconfiguredApiPrivateKey = () => {
    const googleSheetDoc2 = new GoogleSpreadsheet(SHEET_ID)

    try {
        googleSheetDoc2.useServiceAccountAuth({
             client_email: serviceAccountKey.client_email, 
             private_key: 'broken-key'
        })
    } catch (error) {
        // 
    }

    return new DatabaseOperations(googleSheetDoc2)
}

const dbOperationWithMisconfiguredSheetId = () => { 
}
const dbOperationWithMisconfiguredClientEmail = () => {
}

export const dbOperationWithValidDB = () => {
    const googleSheetDoc = createPool()
    const dbOperations = new DatabaseOperations(googleSheetDoc)
    return { dbOperations, cleanup: () => {} }
}

export const misconfiguredDbOperationOptions = () => ([   
    ['pool connection with wrong apiPrivateKey', () => dbOperationWithMisconfiguredApiPrivateKey()],
    // ['pool connection with wrong client_email', () => dbOperationWithMisconfiguredClientEmail()],
    // ['pool connection with wrong sheetId', () => dbOperationWithMisconfiguredSheetId()],

])
