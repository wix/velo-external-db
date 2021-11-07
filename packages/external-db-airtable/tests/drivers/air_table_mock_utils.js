const { AirtableBase } = require('./air_table_base')

class AirtableError extends Error {
    constructor(error, message, status) {
        super(message);
        this.error = error
        this.status = status
    }
}

const base = new AirtableBase('app123', 'base')

const _checkParamsMiddleware = (req, res, next) => {
    if (req.get('authorization') !== 'Bearer key123')
        return next(new AirtableError('AUTHENTICATION_REQUIRED', 'You should provide valid api key to perform this operation', '401'))

    if (req.params.baseId !== 'app123')
        return next(new AirtableError('NOT_FOUND', 'Could not find what you are looking for', '404'))
    if (req.params.tableIdOrName && !base.getTable(req.params.tableIdOrName) )
        return next(new AirtableError('NOT_FOUND', `Could not find table ${req.params.tableIdOrName} in application ${req.params.baseId}`, '404'))
    next()
}

const _checkParamsMetaMiddleware = (_checkParamsMiddleware, function (req, res, next) { //TODO: refactor middleware
    if (req.get('X-Airtable-Client-Secret') !== 'meta123')
        return next(new AirtableError('Unauthorized', 'Unauthorized', '401'))
    next()
})

module.exports = { AirtableError, base, _checkParamsMiddleware, _checkParamsMetaMiddleware }