const { minifyRecord, bulkCreateExpr } = require('./airtable_utils')

class DataProvider {
    constructor(pool, filterParser) {
        this.filterParser = filterParser
        this.pool = pool
    }


    async find(collectionName, filter, sort, skip, limit) {
        const { filterExpr } = this.filterParser.transform(filter)
        const filterByFormula = { filterByFormula: filterExpr || '' }
        const limitExpr = limit ? { maxRecords: limit } : {}
        const sortExpr = this.filterParser.orderBy(sort)
        const result = await this.query(collectionName, filterByFormula, limitExpr, sortExpr)
        return result.map(minifyRecord)
    }

    async count(collectionName, filter) {
        const results = await this.find(collectionName, filter)
        return results.length
    }

    async insert(collectionName, items) {
        const createExpr = bulkCreateExpr(items)
        const inserted = await this.pool(collectionName).create(createExpr)
        return inserted.length;
    }

    async update(collectionName, items) {
        const updated = await Promise.all(items.map(async item => await this.updateSingle(collectionName, item)))
        return updated.filter(Boolean).length;
    }

    async updateSingle(collectionName, item) {
            const id = await this.getItemIdBy_id(collectionName, item._id)
            const updated = await this.pool(collectionName).update(id, item)
            return updated.id
    }

    async delete(collectionName, itemIds) {
        const ids = await Promise.all((itemIds.map(async id => await this.getItemIdBy_id(collectionName,id)))) 
        const deleted = await this.pool(collectionName).destroy(ids)
        return deleted.length
    }

    async truncate(collectionName) { 
        const itemIds = (await this.query(collectionName)).map(record => record.id)
        await this.pool(collectionName).destroy(itemIds)
    }

    async getItemIdBy_id(collectionName, _id) {
        const record = await this.query(collectionName, { filterByFormula: `_id = "${_id}" ` })
        return record[0]?.id
    }

    async query(collectionName, filterByFormula, limitExpr, sortExpr) {
        const resultsByPages = []
        await this.pool(collectionName)
            .select({ ...filterByFormula, ...limitExpr, ...sortExpr }) //TODO: skip
            .eachPage((records, fetchNextPage) => {
                resultsByPages.push(records)
                fetchNextPage()
            })

        return resultsByPages.flat();
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