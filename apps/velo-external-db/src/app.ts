import express = require('express')
import { create, readCommonConfig } from '@wix-velo/external-db-config'
import { ExternalDbRouter, Hooks } from '@wix-velo/velo-external-db-core'
import { engineConnectorFor } from './storage/factory'
import * as auth from './auth'

process.env['TYPE'] = 'google-sheet'
process.env['CLOUD_VENDOR'] = 'gcp'
process.env['ROOT_URI'] = 'http://localhost:8080'
process.env['REDIRECT_URI'] = 'auth/callback'

const initConnector = async(hooks?: Hooks) => {
    const { vendor, type: adapterType, hideAppInfo } = readCommonConfig()

    const configReader = create()
    const { authorization, secretKey, ...dbConfig } = await configReader.readConfig()

    const { connector: engineConnector, providers, cleanup } = await engineConnectorFor(adapterType, dbConfig)

    const externalDbRouter = new ExternalDbRouter({
        connector: engineConnector,
        config: {
            authorization: {
                roleConfig: authorization
            },
            secretKey,
            vendor,
            adapterType,
            commonExtended: true,
            hideAppInfo
        },
        hooks,
    })

    return { externalDbRouter, cleanup: async() => await cleanup(), schemaProvider: providers.schemaProvider }
}

export const createApp = async() => {
    const app = express()
    let loggedIn = false
    const initConnectorResponse = await initConnector()
    app.use(auth.router())

    app.get('/', async(_req, _res, next) => {
        if (loggedIn) {
            next()
        } else {
            _res.redirect('/auth/login')
        }
    })

    app.get('/auth/callback', async(req, res) => {
        const code = req.query.code as string
        const { access_token, refresh_token, expiry_date, } = await auth.getToken(code)
        
        const configReader = create()
        const { authorization, secretKey, ... dbConfig2 } = await configReader.readConfig()
        
        const dbConfig = { access_token, refresh_token, expiry_date, sheetId: dbConfig2.sheetId }      
        const { connector } = await engineConnectorFor('google-sheet', dbConfig)

        initConnectorResponse.externalDbRouter.reloadConfig({ connector })

        loggedIn = true
        
        res.redirect('/')
    })
    app.use(initConnectorResponse.externalDbRouter.router)
    const server = app.listen(8080, () => console.log('Connector listening on port 8080'))

    return { server, ...initConnectorResponse, reload: () => initConnector() }
}
