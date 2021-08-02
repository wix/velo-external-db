const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist } = require('velo-external-db-commons').errors

const translateErrorCodes = err => {
    switch (err.code) {
        case '42703':
            throw new FieldDoesNotExist('Collection does not contain a field with this name')
        case '42701':
            throw new FieldAlreadyExists('Collection already has a field with the same name')
        case '42P01':
            throw new CollectionDoesNotExists('Collection does not exists')
        default :
            console.log(err)
            throw new Error(`default ${err.code}`)
    }
}

module.exports = translateErrorCodes
