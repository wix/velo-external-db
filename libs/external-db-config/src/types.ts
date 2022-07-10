export type VeloRole = 'Admin' | 'Member' | 'Visitor'

export interface CollectionPermissions {
    id: string
    read?: VeloRole[]
    write?: VeloRole[]
}

export interface RoleConfig {
    collectionPermissions: CollectionPermissions[]
}

export interface IConfigReader {
    readConfig(): any
    readExternalAndLocalConfig?(): any
    readExternalConfig?(): any
}