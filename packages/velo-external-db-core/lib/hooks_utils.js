

const hooksForAction = (action) => {
    const hooksForAction = {
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
        beforeAggregate: ['beforeAll', 'beforeRead', 'BeforeAggregate'],
        afterAggregate: ['afterAll', 'afterRead', 'AfterAggregate'],
        beforeCount: ['beforeAll', 'beforeRead', 'BeforeCount'],
        afterCount: ['afterAll', 'afterRead', 'AfterCount'],
        beforeGetById: ['beforeAll', 'beforeRead', 'BeforeGetById'],
        afterGetById: ['afterAll', 'afterRead', 'AfterGetById'],
    }
    return hooksForAction[action]
}

const Operations = {
    FIND: 'find',
    INSERT: 'insert',
    BULK_INSERT: 'bulkInsert',
    UPDATE: 'update',
    BULK_UPDATE: 'bulkUpdate',
    REMOVE: 'remove',
    BULK_REMOVE: 'bulkRemove',
    AGGREGATE: 'aggregate',
    COUNT: 'count',
    GET: 'getById',
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
        case Operations.FIND:
            return {
                filter: body.filter,
                limit: body.limit,
                skip: body.skip,
                sort: body.sort
            }
        case Operations.INSERT:
            return {
                item: body.item
            }
        case Operations.BULK_INSERT:
            return {
                items: body.items
            }
        case Operations.UPDATE:
            return {
                item: body.item
            }
        case Operations.BULK_UPDATE:
            return {
                items: body.items
            }
        case Operations.REMOVE:
            return {
                itemId: body.itemId
            }
        case Operations.BULK_REMOVE:
            return {
                itemIds: body.itemIds
            }
        case Operations.AGGREGATE:
            return {
                filter: body.filter,
                processingStep: body.processingStep,
                postFilteringStep: body.postFilteringStep
            }
        case Operations.COUNT:
            return {
                filter: body.filter
            }
        case Operations.GET:
            return {
                itemId: body.itemId
            }
        default:
            return body
    }
}

const requestContextFor = (operation, body) => ({ operation, collection: body.collection })

module.exports = { hooksForAction, Operations, payloadFor, Actions, requestContextFor }