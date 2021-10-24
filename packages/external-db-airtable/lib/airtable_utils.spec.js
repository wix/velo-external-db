const { bulkCreateExpr } = require("./airtable_utils")
const { Uninitialized, gen } = require('test-commons')

describe('Airtable Utils', () => {
    test('bulkCreateExpr return right format of create', () => {
        expect(bulkCreateExpr(ctx.items)).toEqual( ctx.items.map(i => ( { fields: i } )) )
    })

    const ctx = {
        items: Uninitialized,
    }

    beforeEach(async () => {
        ctx.items = gen.randomEntities()
    });
})
