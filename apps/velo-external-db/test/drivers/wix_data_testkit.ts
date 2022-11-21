const express = require('express')

export const app = express()

const authPublicKey = 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQ0lqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FnOEFNSUlDQ2dLQ0FnRUFwUmlyaWk5S1VWcDVpSnRMUTZZNQpRanBDYVdGWGUyOUpxdk1TZStRejNJYjdDM1U1WE1VNlpUdk1XdkxsTUlUTElURGdtT0c2UVpjblVMK3BRYnVvCkwwU3dHbExlRHoyVnN2Znd0RmlTMFBrdVZMeFVpRDIzZVVQS3NMcHNVaW9hS0NxMi9Ocm1NTnBRVUIxaHVMcWMKczk3UlFDSm5DR0g1VHlXSVpEbjdnUkRPZklFcXQzQnZadUFZTkg5WUtSdTFIR1VPTVM0bTkxK2Qramd6RkxJWgpnSGtoNmt2SjlzbFRhWElTaWhaK3lVUElDWEZnN1Jkb2lpOVVXN1E3VFA0R2d6RG0xSkFpQ1M3OCtpZCt6cThQCnNYUVlOWEExNGh1M2dyZm5ZcXk2S1hrZjd5Z0N1UXFmbi8rKy92RjVpcHZkNGdJeFN0QUZCR2pCS2VFVFVVSGgKM2tmVDhqWTNhVHNqTXQzcDZ0RGMyRHRQdDAyVjZpSTU2RDVxVmJNTlp3SCtHUFRkTWZzdkVjN2tHVTFRUlFXUwo1Z1ZZK3FaMzBxbkFxbVlIS2RZSGxpcVNtRzhlclc0aXcyMFZlaEdqeGZQQTYrNXFxNUVnRGJ3VGtPZGZ5aTN0CnVSSEN5WDZ1NHQvWkVGdVVDdmN2UW1hZ0laWUNYT3phNDJBWEErUzBnaWQ5Q2Y4bXNWNnYwNHMvVDhFKy9qUU0KcXVNeEs5bU53QTl6cmdabE5zM08rdHFWaUp1bitFSzRHZ0ovaDlkdit1N1N5TmR5WUZkeEdkT1Nrb3pSclBYcwo2WmNMUFNuZU1vZE5VcEVEdFMvM3h4MW5naDhLelJXY3pQTlZnbENhYTZpN2ZmWG9DaTg4ZTNxVXpnVksvZ3E4CnU0VTJ0Sm1pNWdBQk9EblhuQ1BvRWdVQ0F3RUFBUT09Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQ=='

app.set('case sensitive routing', true)
// app.set('query parser', string => new URLSearchParams(string))

app.use(express.json())

app.get('/v1/external-databases/:externalDatabaseId', (req, res) => {
    // req.params.tableIdOrName

    res.json({
        publicKey: authPublicKey
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
