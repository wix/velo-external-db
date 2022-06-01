const { ItemAlreadyExists } = require('@wix-velo/velo-external-db-commons/lib/errors')

const notThrowingTranslateErrorCodes = err => {
    switch (err.code) {
        case 11000:
            return new ItemAlreadyExists(`Item already exists: ${err.message}`)
        default: 
            return new Error (`default ${err.message}`) 
    }
}

const translateErrorCodes = err => {
    throw notThrowingTranslateErrorCodes(err)
}


module.exports = { translateErrorCodes }