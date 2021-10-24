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
        const inserted = await this.pool(collectionName)
                                   .create(createExpr)
        return inserted.length;
    }

    async update(collectionName, items) {
        const updated = await Promise.all( items.map(async item => await this.updateSingle(collectionName, item)) )
        return updated.length;
    }

    async delete(collectionName, itemIds) {
        const ids = await Promise.all(itemIds.map(async id => await this.wixDataIdToAirtableId(collectionName, id)))
        const deleted = await this.pool(collectionName)
                                  .destroy(ids)
        return deleted.length
    }

    async truncate(collectionName) {
        // todo: ido, query only id's
        // todo: add paging
        const itemIds = (await this.query(collectionName)).map(record => record.id)
        await this.delete(collectionName, itemIds)
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


    async wixDataIdToAirtableId(collectionName, _id) {
        const record = await this.query(collectionName, { filterByFormula: `_id = "${_id}" ` })
        return record[0]?.id
    }

    async updateSingle(collectionName, item) {
        const id = await this.wixDataIdToAirtableId(collectionName, item._id)
        const updated = await this.pool(collectionName)
                                  .update(id, item)
        return updated.id
    }
}

module.exports = DataProvider