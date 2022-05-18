
const hooksForAction = (action) => {
    const hooksForAction = {
        beforeList: ['beforeAll', 'beforeRead', 'beforeList'],
        afterList: ['afterAll', 'afterRead', 'afterList'],
        beforeListHeaders: ['beforeAll', 'beforeRead', 'beforeListHeaders'],
        afterListHeaders: ['afterAll', 'afterRead', 'afterListHeaders'],
        beforeFind: ['beforeAll', 'beforeRead', 'beforeFind'],
        afterFind: ['afterAll', 'afterRead', 'afterFind'],
        beforeCreate: ['beforeAll', 'beforeWrite', 'beforeCreate'],
        afterCreate: ['afterAll', 'afterWrite', 'afterCreate'],
        beforeColumnAdd: ['beforeAll', 'beforeWrite', 'beforeColumnAdd'],
        afterColumnAdd: ['afterAll', 'afterWrite', 'afterColumnAdd'],
        beforeColumnRemove: ['beforeAll', 'beforeWrite', 'beforeColumnRemove'],
        afterColumnRemove: ['afterAll', 'afterWrite', 'afterColumnRemove']
    }
    return hooksForAction[action]
}

const Operations = {
    LIST: 'list',
    LIST_HEADERS: 'listHeaders',
    FIND: 'find',
    CREATE: 'create',
    COLUMN_ADD: 'columnAdd',
    COLUMN_REMOVE: 'columnRemove',
}

const Actions = {
    BeforeList: 'beforeList',
    AfterList: 'afterList',
    BeforeListHeaders: 'beforeListHeaders',
    AfterListHeaders: 'afterListHeaders',
    BeforeFind: 'beforeFind',
    AfterFind: 'afterFind',
    BeforeCreate: 'beforeCreate',
    AfterCreate: 'afterCreate',
    BeforeColumnAdd: 'beforeColumnAdd',
    AfterColumnAdd: 'afterColumnAdd',
    BeforeColumnRemove: 'beforeColumnRemove',
    AfterColumnRemove: 'afterColumnRemove',
    BeforeAll: 'beforeAll',
    AfterAll: 'afterAll',
    BeforeRead: 'beforeRead',
    AfterRead: 'afterRead',
    BeforeWrite: 'beforeWrite',
    AfterWrite: 'afterWrite'
}

const payloadFor = (operation, body) => {
    switch (operation) {
        case Operations.LIST:
            return null
        case Operations.LIST_HEADERS:
            return null
        case Operations.FIND:
            return body.schemaIds
        case Operations.CREATE:
            return body.collectionName
        case Operations.COLUMN_ADD:
            return body.column
        case Operations.COLUMN_REMOVE:
            return body.columnName
        default:
            return body
    }
}

module.exports = { hooksForAction, Operations, payloadFor, Actions }