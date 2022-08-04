import { GoogleSpreadsheet } from 'google-spreadsheet'
import * as serviceAccountKey from '../e2e-testkit/service_account_key.json'
import { SHEET_ID } from '../e2e-testkit/google_sheets_resources'
import DatabaseOperations from '../../src/google_sheet_operations'

const createValidPool = async(sheetID: string, client_email: string, private_key: string) => {
    const googleSheetDoc = new GoogleSpreadsheet(sheetID)

    await googleSheetDoc.useServiceAccountAuth({ client_email, private_key })

    return googleSheetDoc
}

const createInValidPool = async(sheetID: string, client_email: string, private_key: string) => {
    const googleSheetDoc = new GoogleSpreadsheet(sheetID)

    try {
        await googleSheetDoc.useServiceAccountAuth({ client_email, private_key })
    } catch (error) {
        // 
    }

    return googleSheetDoc

}

const dbOperationWithMisconfiguredApiPrivateKey = async() => {
    const googleSheetPoolWithBrokenApi = await createInValidPool(SHEET_ID, serviceAccountKey.client_email, 'broken-api-key')
    return new DatabaseOperations(googleSheetPoolWithBrokenApi)
}

const dbOperationWithMisconfiguredSheetId = async() => {
    const googleSheetWPoolithBrokenSheetID = await createInValidPool('broken-sheed-id', serviceAccountKey.client_email, serviceAccountKey.private_key)
    return new DatabaseOperations(googleSheetWPoolithBrokenSheetID)
}
const dbOperationWithMisconfiguredClientEmail = async() => {
    const googleSheetPoolWithBrokenClientEmail = await createInValidPool(SHEET_ID, 'invalid-client-email', serviceAccountKey.private_key)
    return new DatabaseOperations(googleSheetPoolWithBrokenClientEmail)
}

export const dbOperationWithValidDB = async() => {
    const googleSheetDoc = await createValidPool(SHEET_ID, serviceAccountKey.client_email, serviceAccountKey.private_key)
    const dbOperations = new DatabaseOperations(googleSheetDoc)
    return { dbOperations, cleanup: () => {} }
}

export const misconfiguredDbOperationOptions = () => ([   
    ['pool connection with wrong apiPrivateKey', async() => await dbOperationWithMisconfiguredApiPrivateKey()],
    ['pool connection with wrong client_email', async() => await dbOperationWithMisconfiguredClientEmail()],
    ['pool connection with wrong sheetId', async() => await dbOperationWithMisconfiguredSheetId()],
])
