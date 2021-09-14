const { SystemFields, validateSystemFields, asWixSchema } = require('velo-external-db-commons')
const { translateErrorCodes } = require('./google_sheet_exception_translator')


class SchemaProvider {
    constructor(sheet, sheetId) {
        this.sheetId = sheetId
        this.sheet = sheet
    }

    reformatFields(field) {
        return {
            field: field.name,
            type: field.type,
        }
    }

    async list() {
        const sheetsProperties = (await  this.sheet.spreadsheets.get({ spreadsheetId:this.sheetId })).data.sheets
        const sheetsFields = await Promise.all( sheetsProperties.map( async(s) => {
            const fields = (await  this.sheet.spreadsheets.values.get({
                spreadsheetId:this.sheetId,
                range: `${s.properties.title}!1:1`,
            })).data.values

            return {id: s.properties.title, fields: fields[0].map (i => ({ name : i, type: 'text'}))}
        }))

        return sheetsFields.map(({id, fields}) => {
            return asWixSchema([...fields].map(this.reformatFields), id)
        })
    }

    async create(collectionName, columns) {
        try{
            await this.sheet.spreadsheets.batchUpdate({
                spreadsheetId: this.sheetId,
                requestBody: {
                    requests: [{
                        addSheet:{
                            properties:{
                                title: collectionName
                            }
                        }
                    }]
                }
            })

            await this.sheet.spreadsheets.values.append({
                spreadsheetId:this.sheetId,
                range: `${collectionName}`,
                valueInputOption: 'USER_ENTERED',
                resource: { values: [[...SystemFields, ...(columns || [])].map(f => f.name)]},
            })
        } catch(err){
            translateErrorCodes(err)
        }
    }

    async addColumn(collectionName, column) {
        await validateSystemFields(column.name)
        try{
            const row = await  this.sheet.spreadsheets.values.get({
                spreadsheetId:this.sheetId,
                range: `${collectionName}!1:1`,
            })
            
            const newRow = row.data.values[0].concat(column.name)

            await  this.sheet.spreadsheets.values.update({
                spreadsheetId:this.sheetId,
                range: `${collectionName}!1:1`,
                valueInputOption: 'USER_ENTERED',
                resource: { values: [newRow] },
            })

        } catch(err){
            translateErrorCodes(err)
        }

    }
}

module.exports = SchemaProvider