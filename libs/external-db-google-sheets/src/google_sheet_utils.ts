import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet'
import { errors } from '@wix-velo/velo-external-db-commons'
import { GoogleSheetsConfig } from './types'
import { OAuth2Client } from 'google-auth-library'

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
    if (process.env['NODE_ENV'] === 'test') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        doc.axios.defaults.baseURL = `http://localhost:1502/v4/spreadsheets/${config.sheetId}`
        doc.useRawAccessToken('mockup-token')
        return
    }

    if (config.access_token && config.refresh_token && config.expiry_date) {
        const oauthClient = new OAuth2Client({
            clientId: process.env['CLIENT_ID'],
            clientSecret: process.env['CLIENT_SECRET']
        })
        
        oauthClient.credentials.access_token = config.access_token
        oauthClient.credentials.refresh_token = config.refresh_token
        oauthClient.credentials.expiry_date = config.expiry_date

        doc.useOAuth2Client(oauthClient)
        return
    } 

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
