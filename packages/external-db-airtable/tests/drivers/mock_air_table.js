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
        return next(new AirtableError('AUTHENTICATION_REQUIRED','You should provide valid api key to perform this operation','401'))
    
    if (req.params.baseId !== 'app123')
        return next(new AirtableError('NOT_FOUND','Could not find what you are looking for','404'))

    if (req.params.tableIdOrName !== 'Table') 
        return next(new AirtableError('NOT_FOUND',`Could not find table ${req.params.tableIdOrName} in application ${req.params.baseId}`,'404'))
    next()
}


const app = express()
app.set('case sensitive routing', true);
app.set('query parser', string => new URLSearchParams(string));

app.use(express.json());
app.use((req, res, next) => {
    req.app.set('most recent request', req);
    next();
});

app.use((req, res, next) => {
    const handlerOverride = req.app.get('handler override');
    if (handlerOverride) {
        handlerOverride(req, res, next);
    } else {
        next();
    }
});

app.post('/v0/:baseId/:tableIdOrName', _checkParamsMiddleware, (req, res) => {
    const isCreatingJustOneRecord = !!req.body.fields;
    const recordsInBody = isCreatingJustOneRecord ? [req.body] : req.body.records;

    const records = recordsInBody.map((record, index) => {
        globalIndex++
        const newRecord = {id:'rec' + globalIndex, ...record}
        data.push(newRecord)
        const fields = req.body.typecast ? { typecasted: true } : record.fields;
        return newRecord
    });
    const responseBody = isCreatingJustOneRecord ? records[0] : { records: records };
    res.json(responseBody);
})

app.get('/v0/:baseId/:tableIdOrName?', _checkParamsMiddleware, (req, res) => {
    res.json({
        records: data
    });
})

const singleRecordUpdate = [
    _checkParamsMiddleware,
    (req, res) => {
        const index = data.findIndex(obj=>obj.id === req.params.recordId)
        data[index].fields = Object.assign({}, data[index].fields, req.body.fields) 
        var fields = req.body.typecast ? { typecasted: true } : req.body.fields;
        // res.json({
        //     id: req.params.recordId,
        //     fields: fields,
        // });
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
    data = data.filter ((item)=>item.id != req.params.recordId)
    res.json({
        id: req.params.recordId,
        deleted: true,
    });
});

app.delete('/v0/:baseId/:tableIdOrName', _checkParamsMiddleware, function (req, res) {
    res.json({
        records: req.query.getAll('records[]').map(function (recordId) {
            return {
                id: recordId,
                deleted: true,
            };
        }),
    });
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
