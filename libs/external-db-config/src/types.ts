export type VeloRole = 'Admin' | 'Member' | 'Visitor'

interface CollectionPermissions {
    id: string
    read?: VeloRole[]
    write?: VeloRole[]
}

export interface RoleConfig {
    collectionPermissions: CollectionPermissions[]
}
