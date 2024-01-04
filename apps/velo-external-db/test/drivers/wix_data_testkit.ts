import { authConfig } from '@wix-velo/test-commons'
import * as express from 'express'

export const app = express()

app.set('case sensitive routing', true)

app.use(express.json())

app.get('/v1/external-databases/:externalDatabaseId/public-keys', (_req, res) => {
    res.json({
        publicKeys: [
            { id: authConfig.kid, publicKeyPem: authConfig.authPublicKey },
        ]
    })
})

app.use((_req, res) => {
    res.status(404)
    res.json({ error: 'NOT_FOUND' })
})

app.use((err, _req, res, next) => {
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
