export interface GetCapabilitiesRequest {}

// Global capabilities that datasource supports.
export interface GetCapabilitiesResponse {
  capabilities: Capabilities
}

export interface Capabilities {
  // Defines which collection operations is supported.
  collection: CollectionCapability[]
}

export enum CollectionCapability {
    // Supports creating new collections.
    CREATE = 'CREATE'
}
