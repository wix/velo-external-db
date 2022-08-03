import { minifyAndFixDates, DEFAULT_MAX_RECORDS, EmptySort } from './airtable_utils'
import { Base as AirtableBase } from 'airtable'
import { IAirtableFilterParser } from './sql_filter_transformer'
import { IDataProvider, AdapterFilter as Filter,  Item } from '@wix-velo/velo-external-db-types'


type AirtableQuery = {
    collectionName: string,
    filterByFormula?: any,
    limitExpr?: any,
    sortExpr?: any,
    idsOnly?: boolean,
    skip?: number,
    projection?: any
}

export default class DataProvider implements IDataProvider {
    filterParser: IAirtableFilterParser
    base: AirtableBase
    constructor(base: any, filterParser: any) {
        this.filterParser = filterParser
        this.base = base
    }


    async find(collectionName: string, filter: Filter, sort: any, skip: any, limit: any, projection: any): Promise<Item[]> {
        const filterByFormula = this.filterToFilterByFormula(filter)
        const limitExpr = limit ? { maxRecords: limit } : {}
        const sortExpr = this.filterParser.orderBy(sort)
        const projectionExpr = this.filterParser.selectFieldsFor(projection)
        const result = await this.query({ collectionName, filterByFormula, projection: projectionExpr, limitExpr, sortExpr, skip })
        return result.map(minifyAndFixDates)
    }

    async count(collectionName: string, filter: Filter): Promise<number> {
        let count = 0
        await this.base(collectionName)
                  .select(this.filterToFilterByFormula(filter))
                  .eachPage((records: string | any[], fetchNextPage: () => void) => {
                    count += records.length
                    fetchNextPage()
                  })
        return count
    }

    async insert(collectionName: string, items: Item[]): Promise<number> {
        const createExpr = this.bulkCreateExpr(items)
        const inserted = await this.base(collectionName)
                                   .create(createExpr)
        return inserted.length
    }

    async update(collectionName: string, items: Item[]): Promise<number> {
        const updated = await Promise.all( items.map(async(item: any) => await this.updateSingle(collectionName, item)) )
        return updated.length
    }

    async delete(collectionName: string, itemIds: string[]): Promise<number> {
        const ids = await Promise.all(itemIds.map(async(id: any) => await this.wixDataIdToAirtableId(collectionName, id)))
        const deleted = await this.base(collectionName)
                                  .destroy(ids)
        return deleted.length
    }

    async truncate(collectionName: string): Promise<void> {
        await this.base(collectionName)
                  .select()
                  .eachPage(async(records: any[], fetchNextPage: () => void) => {
                      await this.base(collectionName)
                                .destroy(records.map((record: { id: any }) => record.id))
                      fetchNextPage()
                  })
    }


    async query({ collectionName, filterByFormula, limitExpr, sortExpr, idsOnly, skip, projection }: AirtableQuery) {
        const resultsByPages: any[] = []
        
        const limit = limitExpr?.maxRecords ? limitExpr : { maxRecords: DEFAULT_MAX_RECORDS }
        limit.maxRecords += skip 

        const sort = EmptySort
        if (sortExpr && sortExpr.sort) Object.assign (sort, sortExpr)
        await this.base(collectionName)
                  .select({ ...filterByFormula, ...limitExpr, ...sort })
                  .eachPage((records: any[], fetchNextPage: () => void) => {
                    let recordsToReturn
                    if (idsOnly) recordsToReturn = records.map((record: { id: any }) => record.id)
                    else { 
                        recordsToReturn = projection ? records.map((record: { fields: { [x: string]: any } }) => {
                                  return projection.reduce((pV: any, cV: string | number) => (
                                      { ...pV, [cV]: record.fields[cV] }
                                  ), {})
                        }): records.map((record: { fields: any }) => record.fields)
                    }

                      resultsByPages.push(recordsToReturn)
                      fetchNextPage()
                  })
        return resultsByPages.flat().slice(skip) //TODO: find other solution for skip! at least don't load everything to memory.    
    }


    filterToFilterByFormula(filter: Filter) {
        // @ts-ignore
        const { filterExpr } = this.filterParser.transform(filter)
        return { filterByFormula: filterExpr || '' }
    }

    async wixDataIdToAirtableId(collectionName: string, _id: any) {
        const record = await this.query({ collectionName, filterByFormula: { filterByFormula: `_id = "${_id}" ` }, idsOnly: true })
        return record[0]
    }

    async updateSingle(collectionName: string, item: { _id: any }) {
        const id = await this.wixDataIdToAirtableId(collectionName, item._id)
        const updated = await this.base(collectionName)
                                  .update(id, item)
        return updated.id
    }
    
    bulkCreateExpr(items: any[]) {
        return items.reduce((pV: { fields: any }[], cV: any) => {
                                pV.push({ fields: { ...cV } })
                                return pV
          }, [])
    }
}
