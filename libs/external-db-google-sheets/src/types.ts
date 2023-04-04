export type GoogleSheetsConfig = {
    sheetId: string,
    clientEmail?: string,
    apiPrivateKey?: string
    stdTtl?: number,
    checkPeriod?: number,
}
