import { DomainIndex, IIndexProvider } from '@wix-velo/velo-external-db-types'
import { Index as SpiIndex, IndexField, IndexFieldOrder, IndexStatus } from '../spi-model/indexing'

export default class IndexService {
    storage: IIndexProvider
    constructor(storage: any) {
        this.storage = storage
    }

    async list(collectionName: string) {
        const indexes = await this.storage.list(collectionName)
        return indexes.map(this.domainIndexToSpiIndex)
    }

    async create(collectionName: string, index: SpiIndex) {
        const domainIndex = this.spiIndexToDomainIndex(index)
        try {
            const createdIndex = await this.storage.create(collectionName, domainIndex)
            return this.domainIndexToSpiIndex(createdIndex)
        } catch (e: any) {
            return {
                ...index,
                status: IndexStatus.FAILED,
                error: e.message,
            } as SpiIndex
        } 
    }

    async remove(collectionName: string, indexName: string) {
        await this.storage.remove(collectionName, indexName)
        return {}
    }

    private domainIndexToSpiIndex(domainIndex: DomainIndex): SpiIndex {
        return {
            name: domainIndex.name,
            fields: domainIndex.columns.map(column => ({ path: column, order: domainIndex.order })) as IndexField[],
            unique: domainIndex.isUnique,
            caseInsensitive: domainIndex.caseInsensitive,
            status: IndexStatus.ACTIVE,
        }
    }

    private spiIndexToDomainIndex(spiIndex: SpiIndex): DomainIndex{
        return {
            name: spiIndex.name,
            columns: spiIndex.fields.map(field => field.path),
            isUnique: spiIndex.unique,
            caseInsensitive: spiIndex.caseInsensitive,
            order: spiIndex.fields[0].order,
        }
    }
}