const { bulkCreateExpr } = require("./airtable_utils")
const { Uninitialized, gen } = require('test-commons')

describe('Airtable Utils', () => {
    test('bulkCreateExpr return right format of create', () => {
        expect(bulkCreateExpr([ctx.item, ctx.anotherItem])).toEqual([{ fields: ctx.item }, { fields: ctx.anotherItem }])
    })

    const ctx = {
        column: Uninitialized,
        item: Uninitialized,
        anotherItem: Uninitialized,
    }

    beforeEach(async () => {
        ctx.column = gen.randomColumn()
        ctx.item = gen.randomEntity([ctx.column.name])
        ctx.anotherItem = gen.randomEntity([ctx.column.name])
    });
})
