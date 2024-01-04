const express = require('express')
const { base, _checkParamsMiddleware, _checkParamsMetaMiddleware } = require('./air_table_mock_utils')

const app = express()

app.set('case sensitive routing', true)
app.set('query parser', string => new URLSearchParams(string))

app.use(express.json())


//insert / bulk/insert 
app.post('/v0/:baseId/:tableIdOrName', _checkParamsMiddleware, (req, res) => {
    const isCreatingJustOneRecord = !!req.body.fields
    const recordsInBody = isCreatingJustOneRecord ? [req.body] : req.body.records
    const table = base.getTable(req.params.tableIdOrName)

    const newRecords = table.insert(recordsInBody)
    res.json({ records: newRecords })
})


//find
app.get('/v0/:baseId/:tableIdOrName?', _checkParamsMiddleware, (req, res) => {
    const sortField = req.query.get('sort[0][field]')
    const sortDir = req.query.get('sort[0][direction]') === 'desc' ? -1 : 1

    //support only equal for now.
    const filter = req.query.get('filterByFormula')
    const params = filter ? filter.split(' ') : ''
    const table = base.getTable(req.params.tableIdOrName)
    const records = params ? table.data.filter(item => `"${item.fields[params[0]]}"` === params[2]) : table.getAllRows()
    res.json({
        records: sortField ? records.sort((a, b) => (a.fields[sortField] > b.fields[sortField]) ? sortDir : -1 * sortDir) : records
    })
})

const singleRecordUpdate = [
    _checkParamsMiddleware,
    (req, res) => {
        const table = base.getTable(req.params.tableIdOrName)
        const index = table.data.findIndex(obj => obj.id === req.params.recordId)
        table.data[index].fields = { ...table.data[index].fields, ...req.body.fields }

        res.json(table.data[index])
    },
]


const batchRecordUpdate = [
    _checkParamsMiddleware,
    (req, res) => {
        res.json({
            records: req.body.records.map(function(record) {
                const fields = req.body.typecast ? { typecasted: true } : record.fields
                return {
                    id: record.id,
                    fields,
                }
            }),
        })
    },
]

app.patch('/v0/:baseId/:tableIdOrName/:recordId', singleRecordUpdate)
app.put('/v0/:baseId/:tableIdOrName/:recordId', singleRecordUpdate)

app.patch('/v0/:baseId/:tableIdOrName', batchRecordUpdate)
app.put('/v0/:baseId/:tableIdOrName', batchRecordUpdate)


app.delete('/v0/:baseId/:tableIdOrName/:recordId', _checkParamsMiddleware, function(req, res) {
    const table = base.getTable(req.params.tableIdOrName)
    const deleted = table.deleteSingle(req.params.recordId)
    res.json({
        id: req.params.recordId,
        deleted
    })
})


app.delete('/v0/:baseId/:tableIdOrName', _checkParamsMiddleware, function(req, res) {
    const table = base.getTable(req.params.tableIdOrName)
    const records = req.query.getAll('records[]').map((recordId) => {
        return {
            id: recordId,
            deleted: table.delete(recordId),
        }
    })
    res.json({ records })
})


// *************** Meta API **********************

app.get('/v0/meta/bases/:baseId/tables', _checkParamsMetaMiddleware, function(req, res) {
    res.json(base.tablesList())
})

app.post('/v0/meta/bases/:baseId/table', _checkParamsMetaMiddleware, async(req, res) => {
    base.createTable(req.body.collectionName, req.body.columns)
    res.json({})
})

app.post('/v0/meta/bases/:baseId/table/drop', _checkParamsMetaMiddleware, async(req, res) => {
    base.deleteTable(req.body.collectionName)
    res.json({})
})

app.post('/v0/meta/bases/:baseId/tables/:tableIdOrName/addColumn', (req, res) => {
    const table = base.getTable(req.params.tableIdOrName)
    const column = req.body.column
    table.addColumn(column.name, column.type)
    res.json({})
})

app.post('/v0/meta/bases/:baseId/tables/:tableIdOrName/removeColumn', (req, res) => {
    const table = base.getTable(req.params.tableIdOrName)
    table.removeColumn(req.body.column)
    res.json({})
})


app.use(function(req, res) {
    res.status(404)
    res.json({ error: 'NOT_FOUND' })
})

app.use((err, req, res, next) => {
    res.status(err.status)
    res.json({
        error: {
            message: err.message,
            status: err.status,
            error: err.error
        }
    })
    next()
})







module.exports = { app, cleanup: () => { base.tables = [] } }
