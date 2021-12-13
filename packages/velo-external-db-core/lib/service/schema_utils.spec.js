const { fieldsWithoutSubType } = require('./schema_utils')
const { Uninitialized, gen } = require('test-commons')

describe('Schema utils', () => {
    test('fieldsWithoutSubType should remove subtype from fields', () => {
        const fields = {
            [ctx.fieldName]: {
              displayName: ctx.fieldName,
              type: 'type',
              subtype: 'subtype',
            },
            [ctx.anotherFieldName]: {
              displayName: ctx.anotherFieldName,
              type: 'type',
            },
        } 
        expect(fieldsWithoutSubType(fields)).toEqual({
            [ctx.fieldName]: {
              displayName: ctx.fieldName,
              type: 'type',
            },
            [ctx.anotherFieldName]: {
              displayName: ctx.anotherFieldName,
              type: 'type',
            }
          })
    })

    const ctx = {
      fieldName: Uninitialized,
      anotherFieldName: Uninitialized,
    }
    
    beforeEach(() => {
      ctx.fieldName = gen.randomFieldName()
      ctx.anotherFieldName = gen.randomFieldName()
    })
})