

import * as express from 'express'
import { OAuth2Client } from 'google-auth-library'

const getOauthClient = () => {
    const clientId = process.env['CLIENT_ID']
    const clientSecret = process.env['CLIENT_SECRET']
    const ROOT_URI = process.env['ROOT_URI']
    const REDIRECT_URI = process.env['REDIRECT_URI']

    return new OAuth2Client({
        clientId,
        clientSecret,
        redirectUri: `${ROOT_URI}/${REDIRECT_URI}`,
    })
}

export const getGoogleAuthURL = () => {
    const oauthClient = getOauthClient()
    
    const scopes = [
        'https://www.googleapis.com/auth/spreadsheets',
    ]

    return oauthClient.generateAuthUrl({
        access_type: 'offline',
        scope: scopes.join(' '),
        prompt: 'consent'
    })
  
}

export const getToken = async(code: string ) => {
    const oauthClient = getOauthClient()

    const { tokens } = await oauthClient.getToken(code)


    return tokens
}

export const router = () => {
    const router = express.Router()
    router.get('/auth/login', (req, res) => {
        return res.redirect(getGoogleAuthURL())
    })

    return router
}
