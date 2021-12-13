const { fieldsWithoutSubType } = require('./schema_utils')

describe('Schema utils', () => {
    test('fieldsWithoutSubType should remove subtype from fields', () => {
        const fields = {
            _owner: {
              displayName: '_owner',
              type: 'text',
              subtype: undefined,
            },
            _id: {
              displayName: '_id',
              type: 'text',
              subtype: undefined,
            },
            _createdDate: {
              displayName: '_createdDate',
              type: 'datetime',
              subtype: 'timestamp',
            },
            _updatedDate: {
              displayName: '_updatedDate',
              type: 'datetime',
              subtype: 'timestamp',
            }
          }
        expect(fieldsWithoutSubType(fields)).toEqual({
            _owner: {
              displayName: '_owner',
              type: 'text',
            },
            _id: {
              displayName: '_id',
              type: 'text',
            },
            _createdDate: {
              displayName: '_createdDate',
              type: 'datetime',
            },
            _updatedDate: {
              displayName: '_updatedDate',
              type: 'datetime',
            }
          })
    })
})