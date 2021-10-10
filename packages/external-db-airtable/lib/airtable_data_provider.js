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
        const sortExpr = this.filterParser.orderBy(sort).sortExpr
        const skipExpr = this.filterParser.skipExpression(skip)
        const resultsByPages = []
        await this.pool(collectionName)
                                 .select({...filterByFormula, ...limitExpr, ...sortExpr, ...skipExpr}) //TODO: skip
                                 .eachPage((records,fetchNextPage)=>{
                                    resultsByPages.push(records)
                                    fetchNextPage()
                                })
                  
        return resultsByPages.map(page => page.map(minifyRecord));


    }

    async count(collectionName, filter) {
          const results = await this.find(collectionName,filter)
          console.log(results);
          return results.length
    }

    async insert(collectionName, items) {
        console.log(items);
        const result = await this.pool(collectionName)
                                    .create(items)
    }

    async update(collectionName, items) {
        const updated = await Promise.all(items.map(async item => await this.updateSingle(collectionName, item)))
        return updated.filter(Boolean).length;
    }

    async updateSingle(collectionName, item) {
        try{
            const itemToUpdate = Object.assign({}, item)
            delete itemToUpdate._id
            const updated = await this.pool(collectionName).update(item._id,itemToUpdate)
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
        
        async deleteSingle(collectionName,itemId) {
            try{
                const deleted = await this.pool(collectionName).destroy(itemId)
                return deleted.id
            } catch(e){
                return;
            }
        }

        async truncate(collectionName) { //TODO: check if can do it more efficient 
            const itemIds = (await this.find(collectionName)).map(item=>item.id)
            await this.delete(collectionName,itemIds)
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