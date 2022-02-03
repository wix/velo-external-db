const passport = require('passport')
const { Router } = require('express')

class AuthenticationService {
    constructor({ authProvider, authInformation }) {
        this.authProvider = authProvider
        this.authInformation = authInformation

        this.authName = 'external-db-authentication'
        
        this.loginPath = '/auth/login'
        this.loginCallbackPath = '/auth/callback'
        this.logoutPath = '/auth/logout'

        this.authRouter = new Router()
    }

    router() {
        this.authRouter.use(passport.initialize())
        this.authRouter.use(passport.session())
        
        passport.serializeUser((user, done) => done(null, user))
        passport.deserializeUser((user, done) => done(null, user))
        passport.use(this.authName, this.authProvider)

        this.createLoginHandler()
        this.createLoginCallbackHandler()
        this.createLogoutHandler()
        
        this.createAuthenticationMiddleware()
        this.createAuthErrorMiddleware()
        
        return this.authRouter
    }

    createLoginHandler() {

        this.authRouter.use(this.loginPath, passport.authenticate(this.authName))
    }

    createLoginCallbackHandler() {
        const redirectOptions = { successReturnToOrRedirect: '/', failureRedirect: '/auth/login' }
        this.authRouter.use(this.loginCallbackPath, passport.authenticate(this.authName, redirectOptions))
    }

    createLogoutHandler() {
        this.authRouter.get(this.logoutPath, (req, res) => {
            req.logout()
            res.redirect('/')
        })
    }

    createAuthenticationMiddleware() {
        const { validAuthConfig, message } = this.authInformation
        this.authRouter.get('/', async(req, res, next) => {
            if (!req.isAuthenticated()) {
                return res.render('login', { isValidAuthService: validAuthConfig, statusMessage: message })
            }
            next()
        })
    }

    createAuthErrorMiddleware() {
        this.authRouter.use((err, req, res, next) => {
            res.status(401)
            next(err)
        })

    }

}

module.exports = { AuthenticationService }
