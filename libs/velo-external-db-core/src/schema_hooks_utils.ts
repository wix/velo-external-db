import { CollectionOperationSPI } from '@wix-velo/velo-external-db-types'
import { ListCollectionsRequest, DeleteCollectionRequest, CreateCollectionRequest, UpdateCollectionRequest } from './spi-model/collection'



export const SchemaHooksForAction: { [key: string]: string[] } = {
    beforeGet: ['beforeAll', 'beforeRead', 'beforeGet'],
    afterGet: ['afterAll', 'afterRead', 'afterGet'],
    beforeCreate: ['beforeAll', 'beforeWrite', 'beforeCreate'],
    afterCreate: ['afterAll', 'afterWrite', 'afterCreate'],
    beforeUpdate: ['beforeAll', 'beforeWrite', 'beforeUpdate'],
    afterUpdate: ['afterAll', 'afterWrite', 'afterUpdate'],
    beforeDelete: ['beforeAll', 'beforeWrite', 'beforeDelete'],
    afterDelete: ['afterAll', 'afterWrite', 'afterDelete']
}


export const SchemaActions = {
    BeforeGet: 'beforeGet',
    AfterGet: 'afterGet',
    BeforeCreate: 'beforeCreate',
    AfterCreate: 'afterCreate',
    BeforeUpdate: 'beforeUpdate',
    AfterUpdate: 'afterUpdate',
    BeforeDelete: 'beforeDelete',
    AfterDelete: 'afterDelete',
    BeforeAll: 'beforeAll',
    AfterAll: 'afterAll',
    BeforeRead: 'beforeRead',
    AfterRead: 'afterRead',
    BeforeWrite: 'beforeWrite',
    AfterWrite: 'afterWrite'
}



export const schemaPayloadFor = (operation: CollectionOperationSPI, body: any) => {
    switch (operation) {
        case CollectionOperationSPI.Get:
            return { collectionIds: body.collectionIds } as ListCollectionsRequest
        case CollectionOperationSPI.Create:
            return { collection: body.collection } as CreateCollectionRequest
        case CollectionOperationSPI.Update:
            return { collection: body.collection } as UpdateCollectionRequest
        case CollectionOperationSPI.Delete:
            return { collectionId: body.collectionId } as DeleteCollectionRequest
        default:
            return body
    }
}
