const { translateErrorCodes } = require('./google_sheet_exception_translator')


class DataProvider {
    constructor(sheet, sheetId) {
        this.sheetId = sheetId
        this.sheet = sheet
    }

    async find(collectionName, filter, sort, skip, limit){
        // const filterOperations = this.filterParser.transform(filter)
        // const sortOperations = this.filterParser.orderBy(sort)

        const res = await  this.sheet.spreadsheets.values.get({
            spreadsheetId:this.sheetId,
            range:`${collectionName}!${ skip + 1 }:${ limit + 1 }`
        })

        return res.data.values


    }

    async count(collectionName, filter) {
        const res = await this.sheet.spreadsheets.values.get({
            spreadsheetId: this.sheetId,
            range: `${collectionName}`
        })
        return res.data.values.length
    }

    async insert(collectionName, items) {
        const item = items[0]

        try{
            await this.sheet.spreadsheets.values.append({
                spreadsheetId: this.sheetId,
                range: `${collectionName}`,
                valueInputOption: 'USER_ENTERED',
                resource: { values: [ Object.values(item) ]},
            })
        } catch(err){
            translateErrorCodes(err)
        }
    }

}



module.exports = DataProvider


        // await this.sheet.spreadsheets.batchUpdate({ spreadsheetId : this.sheetId, requestBody: {
        //     requests: [{
        //         setBasicFilter : {
        //             filter: {
        //                 range:{
        //                     sheetId: 170051894
        //                 },
        //                 criteria:{
        //                     1 : {
        //                         'hiddenValues' : ['Male']
        //                     }
        //                 }
        //             },
        //         }
        //     }]
        // } })
    