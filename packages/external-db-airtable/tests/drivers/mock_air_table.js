const express = require('express')
const PORT = 9000


class AirtableError extends Error {
    constructor(error, message, status) {
        super(message);
        this.error = error
        this.status = status
    }
}

let data = []
let globalIndex = 0

const _checkParamsMiddleware = (req, res, next) => {
    if (req.get('authorization') !== 'Bearer key123')
        return next(new AirtableError('AUTHENTICATION_REQUIRED', 'You should provide valid api key to perform this operation', '401'))

    if (req.params.baseId !== 'app123')
        return next(new AirtableError('NOT_FOUND', 'Could not find what you are looking for', '404'))

    if (req.params.tableIdOrName !== 'Table')
        return next(new AirtableError('NOT_FOUND', `Could not find table ${req.params.tableIdOrName} in application ${req.params.baseId}`, '404'))
    next()
}


const app = express()
app.set('case sensitive routing', true);
app.set('query parser', string => new URLSearchParams(string));

app.use(express.json());


//insert / bulk/insert 
app.post('/v0/:baseId/:tableIdOrName', _checkParamsMiddleware, (req, res) => {
    const isCreatingJustOneRecord = !!req.body.fields;
    const recordsInBody = isCreatingJustOneRecord ? [req.body] : req.body.records;
    const records = recordsInBody.map((record, index) => {
        globalIndex++
        const newRecord = { id: 'rec' + globalIndex, ...record }
        data.push(newRecord)
        return newRecord
    });
    const responseBody = isCreatingJustOneRecord ? records[0] : { records: records };
    res.json(responseBody);
})


//find
app.get('/v0/:baseId/:tableIdOrName?', _checkParamsMiddleware, (req, res) => {
    const sortField = req.query.get('sort[0][field]')
    const sortDir = req.query.get('sort[0][direction]') === 'desc' ? -1 : 1

    //support only equal for now.
    const filter = req.query.get('filterByFormula')
    const params = filter ? filter.split(' ') : ''

    const records = params ? data.filter(item => `"${item.fields[params[0]]}"` == params[2]) : data

    res.json({
        records: sortField ? records.sort((a, b) => (a.fields[sortField] > b.fields[sortField]) ? sortDir : -1 * sortDir) : records
    });
})

const singleRecordUpdate = [
    _checkParamsMiddleware,
    (req, res) => {
        const index = data.findIndex(obj => obj.id === req.params.recordId)
        data[index].fields = { ...data[index].fields, ...req.body.fields }

        res.json(data[index])
    },
];


const batchRecordUpdate = [
    _checkParamsMiddleware,
    (req, res) => {
        res.json({
            records: req.body.records.map(function (record) {
                const fields = req.body.typecast ? { typecasted: true } : record.fields;
                return {
                    id: record.id,
                    fields: fields,
                };
            }),
        });
    },
];

app.patch('/v0/:baseId/:tableIdOrName/:recordId', singleRecordUpdate);
app.put('/v0/:baseId/:tableIdOrName/:recordId', singleRecordUpdate);

app.patch('/v0/:baseId/:tableIdOrName', batchRecordUpdate);
app.put('/v0/:baseId/:tableIdOrName', batchRecordUpdate);


app.delete('/v0/:baseId/:tableIdOrName/:recordId', _checkParamsMiddleware, function (req, res) {

    data = data.filter((item) => item.id != req.params.recordId)
    res.json({
        id: req.params.recordId,
        deleted: true,
    });
});


app.delete('/v0/:baseId/:tableIdOrName', _checkParamsMiddleware, function (req, res) {
    const records = req.query.getAll('records[]').map((recordId) => {
        data = data.filter((item) => item.id != recordId)
        return {
            id: recordId,
            deleted: true,
        };
    })
    res.json({ records })
});

app.use(function (req, res) {
    res.status(404);
    res.json({ error: 'NOT_FOUND' });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500);
    res.json({
        error: {
            type: 'TEST_ERROR',
            message: err.message,
        },
    });
});


module.exports = { app, cleanup: () => { } }
