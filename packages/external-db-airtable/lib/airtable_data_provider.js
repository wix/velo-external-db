const { minifyAndFixDates, DEFAULT_MAX_RECORDS, EMPTY_SORT } = require('./airtable_utils')

class DataProvider {
    constructor(base, filterParser) {
        this.filterParser = filterParser
        this.base = base
    }


    async find(collectionName, filter, sort, skip, limit, projection) {
        const filterByFormula = this.filterToFilterByFormula(filter)
        const limitExpr = limit ? { maxRecords: limit } : {}
        const sortExpr = this.filterParser.orderBy(sort)
        const projectionExpr = this.filterParser.selectFieldsFor(projection)
        const result = await this.query({ collectionName, filterByFormula, projection: projectionExpr, limitExpr, sortExpr, skip })
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
        return inserted.length
    }

    async update(collectionName, items) {
        const updated = await Promise.all( items.map(async item => await this.updateSingle(collectionName, item)) )
        return updated.length
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
                  .eachPage(async(records, fetchNextPage) => {
                      await this.base(collectionName)
                                .destroy(records.map(record => record.id))
                      fetchNextPage()
                  })
    }


    async query({ collectionName, filterByFormula, limitExpr, sortExpr, idsOnly, skip, projection }) {
        const resultsByPages = []
        
        const limit = limitExpr?.maxRecords ? limitExpr : { maxRecords: DEFAULT_MAX_RECORDS }
        limit.maxRecords += skip 

        const sort = EMPTY_SORT
        if (sortExpr && sortExpr.sort) Object.assign (sort, sortExpr)
        await this.base(collectionName)
                  .select({ ...filterByFormula, ...limitExpr, ...sort })
                  .eachPage((records, fetchNextPage) => {
                    let recordsToReturn
                    if (idsOnly) recordsToReturn = records.map(record => record.id)
                    else { 
                        recordsToReturn = projection ? records.map(record => {
                                  return projection.reduce((pV, cV) => (
                                      { ...pV, [cV]: record.fields[cV] }
                                  ), {})
                        }): records.map(record => record.fields)
                    }

                      resultsByPages.push(recordsToReturn)
                      fetchNextPage()
                  })
        return resultsByPages.flat().slice(skip) //TODO: find other solution for skip! at least don't load everything to memory.    
    }


    filterToFilterByFormula(filter) {
        const { filterExpr } = this.filterParser.transform(filter)
        return { filterByFormula: filterExpr || '' }
    }

    async wixDataIdToAirtableId(collectionName, _id) {
        const record = await this.query({ collectionName, filterByFormula: { filterByFormula: `_id = "${_id}" ` }, idsOnly: true })
        return record[0]
    }

    async updateSingle(collectionName, item) {
        const id = await this.wixDataIdToAirtableId(collectionName, item._id)
        const updated = await this.base(collectionName)
                                  .update(id, item)
        return updated.id
    }
    
    bulkCreateExpr(items) {
        return items.reduce((pV, cV) => {
                                pV.push({ fields: { ...cV } })
                                return pV
          }, [])
    }
}

module.exports = DataProvider