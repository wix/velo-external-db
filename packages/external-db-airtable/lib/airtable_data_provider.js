const { minifyAndFixDates, DEFAULT_MAX_RECORDS } = require('./airtable_utils')

class DataProvider {
    constructor(base, filterParser) {
        this.filterParser = filterParser
        this.base = base
    }


    async find(collectionName, filter, sort, skip, limit) {
        const filterByFormula = this.filterToFilterByFormula(filter)
        const limitExpr = limit ? { maxRecords: limit } : {}
        const sortExpr = this.filterParser.orderBy(sort)
        const result = await this.query({ collectionName, filterByFormula, limitExpr, sortExpr })
        return result.map(minifyAndFixDates)
    }

    async count(collectionName, filter) {
        let count = 0
        await this.base(collectionName)
                  .select(this.filterToFilterByFormula(filter))
                  .eachPage((records, fetchNextPage) => {
                    count += records.length
                    fetchNextPage()
                  })
        return count
    }

    async insert(collectionName, items) {
        const createExpr = this.bulkCreateExpr(items)
        const inserted = await this.base(collectionName)
                                   .create(createExpr)
        return inserted.length;
    }

    async update(collectionName, items) {
        const updated = await Promise.all( items.map(async item => await this.updateSingle(collectionName, item)) )
        return updated.length;
    }

    async delete(collectionName, itemIds) {
        const ids = await Promise.all(itemIds.map(async id => await this.wixDataIdToAirtableId(collectionName, id)))
        const deleted = await this.base(collectionName)
                                  .destroy(ids)
        return deleted.length
    }

    async truncate(collectionName) {
        await this.base(collectionName)
                  .select()
                  .eachPage(async (records, fetchNextPage) => {
                      await this.base(collectionName)
                                .destroy(records.map(record => record.id))
                      fetchNextPage()
                  })
    }


    async query({ collectionName, filterByFormula, limitExpr, sortExpr, idsOnly}) {
        const resultsByPages = []
        const limit = limitExpr?.maxRecords ? limitExpr : { maxRecords: DEFAULT_MAX_RECORDS }
        await this.base(collectionName)
        .select({ ...filterByFormula, ...limitExpr, ...sortExpr }) //TODO: skip
                  .eachPage((records, fetchNextPage) => {
                      const recordsToReturn = idsOnly ? records.map(record=>record.id) : records 
                      resultsByPages.push(recordsToReturn)
                      fetchNextPage()
                  })
        return resultsByPages.flat();
    }


    filterToFilterByFormula(filter){
        const { filterExpr } = this.filterParser.transform(filter)
        return { filterByFormula: filterExpr || '' }
    }

    async wixDataIdToAirtableId(collectionName, _id) {
        const record = await this.query({collectionName, filterByFormula: { filterByFormula: `_id = "${_id}" ` }, idsOnly: true})
        return record[0]
    }

    async updateSingle(collectionName, item) {
        const id = await this.wixDataIdToAirtableId(collectionName, item._id)
        const updated = await this.base(collectionName)
                                  .update(id, item)
        return updated.id
    }
    
    bulkCreateExpr = (items) => {
        return items.reduce((pV, cV) => {
                                pV.push({ fields: { ...cV } })
                                return pV
          }, [])
    }
}

module.exports = DataProvider