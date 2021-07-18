const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist } = require('velo-external-db-commons')

const translateErrorCodes = err => {
    switch (err.code) {
        case 'ER_CANT_DROP_FIELD_OR_KEY':
            throw new FieldDoesNotExist('Collection does not contain a field with this name')
        case 'ER_DUP_FIELDNAME':
            throw new FieldAlreadyExists('Collection already has a field with the same name')
        case 'ER_NO_SUCH_TABLE':
            throw new CollectionDoesNotExists('Collection does not exists')
        default :
            console.log(err)
            throw new Error(`default ${err.code}`)
    }
}

module.exports = translateErrorCodes
