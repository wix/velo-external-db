import { authConfig } from '@wix-velo/test-commons'
const express = require('express')

export const app = express()

app.set('case sensitive routing', true)

app.use(express.json())

app.get('/v1/external-databases/:externalDatabaseId', (req, res) => {
    res.json({
        publicKey: authConfig.authPublicKey
    })
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

module.exports = { app }
