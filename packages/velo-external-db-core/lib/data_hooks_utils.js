

const HooksForAction = {
    beforeFind: ['beforeAll', 'beforeRead', 'beforeFind'],
    afterFind: ['afterAll', 'afterRead', 'afterFind'],
    beforeInsert: ['beforeAll', 'beforeWrite', 'beforeInsert'],
    afterInsert: ['afterAll', 'afterWrite', 'afterInsert'],
    beforeBulkInsert: ['beforeAll', 'beforeWrite', 'beforeBulkInsert'],
    afterBulkInsert: ['afterAll', 'afterWrite', 'afterBulkInsert'],
    beforeUpdate: ['beforeAll', 'beforeWrite', 'beforeUpdate'],
    afterUpdate: ['afterAll', 'afterWrite', 'afterUpdate'],
    beforeBulkUpdate: ['beforeAll', 'beforeWrite', 'beforeBulkUpdate'],
    afterBulkUpdate: ['afterAll', 'afterWrite', 'afterBulkUpdate'],
    beforeRemove: ['beforeAll', 'beforeWrite', 'beforeRemove'],
    afterRemove: ['afterAll', 'afterWrite', 'afterRemove'],
    beforeBulkRemove: ['beforeAll', 'beforeWrite', 'beforeBulkRemove'],
    afterBulkRemove: ['afterAll', 'afterWrite', 'afterBulkRemove'],
    beforeAggregate: ['beforeAll', 'beforeRead', 'beforeAggregate'],
    afterAggregate: ['afterAll', 'afterRead', 'afterAggregate'],
    beforeCount: ['beforeAll', 'beforeRead', 'beforeCount'],
    afterCount: ['afterAll', 'afterRead', 'afterCount'],
    beforeGetById: ['beforeAll', 'beforeRead', 'beforeGetById'],
    afterGetById: ['afterAll', 'afterRead', 'afterGetById'],
}

const Operations = {
    Find: 'find',
    Insert: 'insert',
    BulkInsert: 'bulkInsert',
    Update: 'update',
    BulkUpdate: 'bulkUpdate',
    Remove: 'remove',
    BulkRemove: 'bulkRemove',
    Aggregate: 'aggregate',
    Count: 'count',
    Get: 'getById',
}

const Actions = {
    BeforeFind: 'beforeFind',
    AfterFind: 'afterFind',
    BeforeInsert: 'beforeInsert',
    AfterInsert: 'afterInsert',
    BeforeBulkInsert: 'beforeBulkInsert',
    AfterBulkInsert: 'afterBulkInsert',
    BeforeUpdate: 'beforeUpdate',
    AfterUpdate: 'afterUpdate',
    BeforeBulkUpdate: 'beforeBulkUpdate',
    AfterBulkUpdate: 'afterBulkUpdate',
    BeforeRemove: 'beforeRemove',
    AfterRemove: 'afterRemove',
    BeforeBulkRemove: 'beforeBulkRemove',
    AfterBulkRemove: 'afterBulkRemove',
    BeforeAggregate: 'beforeAggregate',
    AfterAggregate: 'afterAggregate',
    BeforeCount: 'beforeCount',
    AfterCount: 'afterCount',
    BeforeGetById: 'beforeGetById',
    AfterGetById: 'afterGetById',
    BeforeAll: 'beforeAll',
    AfterAll: 'afterAll',
    BeforeRead: 'beforeRead',
    AfterRead: 'afterRead',
    BeforeWrite: 'beforeWrite',
    AfterWrite: 'afterWrite'
}

const payloadFor = (operation, body) => {
    switch (operation) {
        case Operations.Find:
            return {
                filter: body.filter,
                limit: body.limit,
                skip: body.skip,
                sort: body.sort
            }
        case Operations.Insert:
        case Operations.Update:
            return body.item
        case Operations.BulkInsert:
        case Operations.BulkUpdate:
            return body.items
        case Operations.Get:
        case Operations.Remove:
            return body.itemId
        case Operations.BulkRemove:
            return body.itemIds
        case Operations.Aggregate:
            return {
                filter: body.filter,
                processingStep: body.processingStep,
                postFilteringStep: body.postFilteringStep
            }
        case Operations.Count:
            return body.filter
        default:
            return body
    }
}

const requestContextFor = (operation, body) => ({ operation, collection: body.collection })

module.exports = { HooksForAction, Operations, payloadFor, Actions, requestContextFor }