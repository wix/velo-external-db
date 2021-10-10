const { minifyRecord } = require('./airtable_utils')

class DataProvider {
    constructor(pool, filterParser) {
        this.filterParser = filterParser
        this.pool = pool
    }


    async find(collectionName, filter, sort, skip, limit) {
        const { filterExpr } = this.filterParser.transform(filter)
        const filterByFormula = {filterByFormula: filterExpr||''}
        const limitExpr = limit ? { maxRecords: limit } : {}
        const sortExpr = this.filterParser.orderBy(sort)
        const result = await this.query(collectionName, filterByFormula, limitExpr, sortExpr)
        return result.map(minifyRecord)
    }

    async count(collectionName, filter) {
          const results = await this.find(collectionName,filter)
          return results.length
    }

    async insert(collectionName, items) {
        
        const inserted = await Promise.all(items.map(async item => await this.insertSingle(collectionName, item)))
        return inserted.filter(Boolean).length;

    }
    
    async insertSingle(collectionName, item) {
        try {
            const result = await this.pool(collectionName).create(item)
            return result
        } catch (e) {
            console.log(e);
            return;
        }
    }

    async update(collectionName, items) {
        const updated = await Promise.all(items.map(async item => await this.updateSingle(collectionName, item)))
        return updated.filter(Boolean).length;
    }

    async updateSingle(collectionName, item) {
        try{
            const id = await this.getItemIdBy_id(collectionName,item._id)
            const updated = await this.pool(collectionName).update(id,item)
            return updated.id
        }
        catch(e){
            return ;
        }
        
    }

        async delete(collectionName, itemIds) {
            //TODO: check if collectionName is exist before deleteSingle each of them? 
            const deleted = await Promise.all(itemIds.map(async id => await this.deleteSingle(collectionName, id)))
            return deleted.filter(Boolean).length;
        }
        
        async deleteSingle(collectionName,itemId) { //TODO: check if can do it more efficient
            try{
                const id = await this.getItemIdBy_id(collectionName, itemId)
                return await this.deleteSingleByAirtableId(collectionName, id)
            } catch(e){
                return;
            }
        }

        async deleteSingleByAirtableId(collectionName,itemId) {
            try{
                const deleted = await this.pool(collectionName).destroy(itemId)
                return deleted.id
            }catch(e){
                return ;
            }
        }

        async truncate(collectionName) { //TODO: check if can do it more efficient
            const itemIds = (await this.query(collectionName)).map(record=>record.id)
            await Promise.all(itemIds.map(async id => await this.deleteSingleByAirtableId(collectionName, id)))
        }
        

        async getItemIdBy_id (collectionName, _id) {
            const record = await this.query(collectionName, {filterByFormula: `_id = "${_id}" `})
            return record[0].id
        }


        async query(collectionName,filterByFormula, limitExpr, sortExpr) {
            try {
                const resultsByPages = []
                await this.pool(collectionName)
                            .select({...filterByFormula, ...limitExpr, ...sortExpr}) //TODO: skip
                            .eachPage((records,fetchNextPage)=>{
                            resultsByPages.push(records)
                            fetchNextPage()
                })

                return resultsByPages.flat();
        } catch(e) {
            console.log(e);}
        }

        // async aggregate(collectionName, filter, aggregation) { 
    //         const {filterExpr: whereFilterExpr, parameters: whereParameters} = this.filterParser.transform(filter)
    //         const {fieldsStatement, groupByColumns, havingFilter, parameters} = this.filterParser.parseAggregation(aggregation.processingStep, aggregation.postFilteringStep)

    //         const sql = `SELECT ${fieldsStatement} FROM ${escapeTable(collectionName)} ${whereFilterExpr} GROUP BY ${groupByColumns.map( escapeId ).join(', ')} ${havingFilter}`
    //         const resultset = await this.query(sql, [...whereParameters, ...parameters])
    //                                     .catch( translateErrorCodes )
    //         return resultset
        // }
}

module.exports = DataProvider