export type GoogleSheetsConfig = {
    sheetId: string,
    clientEmail?: string,
    apiPrivateKey?: string,
    enableCache?: boolean,
    stdTtl?: number,
    checkPeriod?: number,
}
