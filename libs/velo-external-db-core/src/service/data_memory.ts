import { AdapterOperators } from '@wix-velo/velo-external-db-commons'
import { IDataProvider, AdapterAggregation as Aggregation, AdapterFilter as Filter, Item, ResponseField, NotEmptyAdapterFilter } from '@wix-velo/velo-external-db-types'
const { eq, include } = AdapterOperators

interface State {
    [collectionName: string] : StateItem
}

interface StateItem {
    items: Promise<Item[]>,
    timestamp: number
}

export default class MemoryDataProvider implements IDataProvider {
    dataProvider: IDataProvider
    state: State
    // Standard time to live in seconds.
    stdTTL: number
    // Time in seconds to check all data and delete expired keys
    checkPeriod: number

    constructor(dataProvider: IDataProvider, stdTTL = 15, checkPeriod = 60) {
        this.dataProvider = dataProvider
        this.state = {}
        this.stdTTL = stdTTL
        this.checkPeriod = checkPeriod
        setInterval(this.checkAndClearState.bind(this), checkPeriod * 1000)
    }

    private isOlderThanStdTTL(timestamp: number) {
        return (Date.now() - timestamp) > this.stdTTL * 1000
    }

    private getAndSetCollection(collectionName: string, filter: Filter, sort: any, skip: number, limit: number, projection: string[], key: string) {
        this.state[key] = {
            items: this.dataProvider.find(collectionName, filter, sort, skip, limit, projection),
            timestamp: Date.now()
        }
    }

    private getCollection(collectionName: string, filter: Filter, sort: any, skip: number, limit: number, projection: string[]) {
        const key = collectionName

        // Collection is not in cache
        if(!this.state[key]) {
            this.getAndSetCollection(collectionName, {}, sort, skip, limit, projection, key)
            return this.state[key].items
        }

        // Collection is in cache but is older than stdTTL
        if(this.isOlderThanStdTTL(this.state[key].timestamp)) {
            this.getAndSetCollection(collectionName, {}, sort, skip, limit, projection, key)
            return this.state[key].items
        }

        // Collection is in cache and is not older than stdTTL
        return this.state[key].items
    }

    clearCollectionFromState(key: string) {
        delete this.state[key]
    }

    // Clear all collections that are older than stdTTL
    private checkAndClearState() {        
        const keys = Object.keys(this.state)
        keys.forEach(key => {
            if (this.isOlderThanStdTTL(this.state[key].timestamp)) {
                this.clearCollectionFromState(key)
            }
        })
    }

    private async insertItemToStateCollection(key: string, _items: Item[]) {
        if (this.state[key]) {
            const items = await this.state[key].items
            items.push(..._items)
        }
    }
    
    async find(collectionName: string, _filter: Filter, sort: any, skip: number, limit: number, projection: string[]): Promise<Item[]> {
        const filter = _filter as NotEmptyAdapterFilter
        const res = await this.getCollection(collectionName, filter, sort, skip, limit, projection)
        
        if (filter && filter.operator === include && filter.fieldName === '_id') {
            return res.filter(item => filter.value.includes(item._id))
        }

        if (filter && filter.operator === eq && filter.fieldName === '_id') {
            return res.filter(item => item._id === filter.value)
        }

        return res
    }

    async count(collectionName: string, filter: Filter): Promise<number> {
        const res = await this.getCollection(collectionName, filter, {}, 0, 0, [])
        return res.length
    }

    async insert(collectionName: string, items: Item[], fields?: ResponseField[] | undefined): Promise<number> {
        const res = await this.dataProvider.insert(collectionName, items, fields)
        this.insertItemToStateCollection(collectionName, items)
        return res
    }
    async update(collectionName: string, items: Item[], fields?: any): Promise<number> {
        return await this.dataProvider.update(collectionName, items, fields)
    }
    async delete(collectionName: string, itemIds: string[]): Promise<number> {
        return await this.dataProvider.delete(collectionName, itemIds)
    }
    async truncate(collectionName: string): Promise<void> {
        return await this.dataProvider.truncate(collectionName)
    }
    async aggregate?(collectionName: string, filter: Filter, aggregation: Aggregation): Promise<Item[]> {
        return await this.dataProvider.aggregate?.(collectionName, filter, aggregation) || []
    }

}
