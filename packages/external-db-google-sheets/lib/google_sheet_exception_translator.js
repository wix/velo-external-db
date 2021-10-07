
const notThrowingTranslateErrorCodes = err => {
    switch (err.code) {
        default :
            return new Error(`default ${err}`)
    }
}
const translateErrorCodes = err => {
    throw new Error(`${err.errors[0].message}`)
}

module.exports = { translateErrorCodes, notThrowingTranslateErrorCodes }
