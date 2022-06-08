const { FieldAlreadyExists } = require('@wix-velo/velo-external-db-commons').errors

const notThrowingTranslateErrorCodes = err => {
    switch (err.code) {
        default :
            return new Error(`default ${err}`)
    }
}
const translateErrorCodes = err => {
    if (err.message.includes('Duplicate header detected')) {
        throw new FieldAlreadyExists()
    } else {
        throw new Error(`${err.errors[0].message}`)
    }
}

module.exports = { translateErrorCodes, notThrowingTranslateErrorCodes }
