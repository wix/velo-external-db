import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet'
import { errors } from '@wix-velo/velo-external-db-commons'
import { GoogleSheetsConfig } from './types'

export const loadSheets = async(doc: GoogleSpreadsheet) => {
    try {
        await doc.loadInfo()
    } catch (error) {
        // what to do in failure?
    }
}

export const describeSheetHeaders = async(sheet: GoogleSpreadsheetWorksheet) => {
    const headers = await headersFrom(sheet)
    return headers.map(h => ({
        table_name: sheet.title,
        field: h,
        type: dateFormatColumns.includes(h) ? 'datetime' : 'text',
    }))
}

export const sheetFor = async(sheetTitle: string, doc: GoogleSpreadsheet) => {
    const sheet = doc.sheetsByTitle[sheetTitle]    
    
    if (!sheet) {
        await doc.loadInfo()
    }

    if (!doc.sheetsByTitle[sheetTitle]) {
        throw new errors.CollectionDoesNotExists('Collection does not exists')
    }
    
    return doc.sheetsByTitle[sheetTitle]
}

export const headersFrom = async(sheet: GoogleSpreadsheetWorksheet) => {
    try{
        await sheet.loadHeaderRow()
        return sheet.headerValues
    } catch (e) {
        return []
    }
}

export const docAuthSetup = async(config: GoogleSheetsConfig, doc: GoogleSpreadsheet) => {
    try {
        await doc.useServiceAccountAuth({
            client_email: config.clientEmail as string,
            private_key: config.apiPrivateKey as string
        })
    } catch (error) {
        // 
    }
}

export const dateFormatColumns = ['_updatedDate', '_createdDate']

const delay = (retryCount: number) => new Promise(resolve => setTimeout(resolve, retryCount * 1000))

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const promiseRetry = async(_promise: any, retryCount = 0, lastError: any = null): Promise<any> => {
    
    if (retryCount > 5) {  
        return new Error(lastError)
    }

    try {
        return await _promise()
    } catch (e: any) {
        if (contains(e.message, '[429]')) {
            const d = 2 ** (retryCount +1) > 80 ? 80: 2 ** (retryCount +1)

            console.log(`429 error - waiting ${d} seconds, ${e.message}`) 

            await delay(d)

            console.log('429 error - retrying ....') 

            return await promiseRetry(_promise, retryCount + 1, e)

        }

        return new errors.UnauthorizedError(e.message)
    }
}

export const contains = (str: string, subStr: string) => {
    return str.indexOf(subStr) > -1
}


