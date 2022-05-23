
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
    List: 'list',
    ListHeaders: 'listHeaders',
    Find: 'find',
    Create: 'create',
    ColumnAdd: 'columnAdd',
    ColumnRemove: 'columnRemove',
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
        case Operations.List:
        case Operations.ListHeaders:
            return null
        case Operations.Find:
            return body.schemaIds
        case Operations.Create:
            return body.collectionName
        case Operations.ColumnAdd:
            return body.column
        case Operations.ColumnRemove:
            return body.columnName
        default:
            return body
    }
}

module.exports = { hooksForAction, Operations, payloadFor, Actions }