export interface IIndexProvider {
    list(collectionName: string): Promise<DomainIndex[]>
    create(collectionName: string, index: DomainIndex): Promise<DomainIndex>
    remove(collectionName: string, indexName: string): Promise<void>
}


export interface DomainIndex {
    name: string
    columns: string[]
    isUnique: boolean
    caseInsensitive: boolean
    order : 'ASC' | 'DESC'
    status?: DomainIndexStatus
    error?: any
}

export enum DomainIndexStatus {
    ACTIVE = 'ACTIVE',
    BUILDING = 'BUILDING',
    FAILED = 'FAILED'
}
