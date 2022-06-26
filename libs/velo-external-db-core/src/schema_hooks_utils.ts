
export const SchemaHooksForAction: { [key: string]: string[] } = {
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

export enum SchemaOperations {
    List = 'list',
    ListHeaders = 'listHeaders',
    Find = 'find',
    Create = 'create',
    ColumnAdd = 'columnAdd',
    ColumnRemove = 'columnRemove',
}

export const SchemaActions = {
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

export const schemaPayloadFor = (operation: SchemaOperations, body: any) => {
    switch (operation) {
        case SchemaOperations.List:
        case SchemaOperations.ListHeaders:
            return {}
        case SchemaOperations.Find:
            return { schemaIds: body.schemaIds }
        case SchemaOperations.Create:
            return { collectionName: body.collectionName }
        case SchemaOperations.ColumnAdd:
            return { column: body.column }
        case SchemaOperations.ColumnRemove:
            return { columnName: body.columnName }
        default:
            return body
    }
}
