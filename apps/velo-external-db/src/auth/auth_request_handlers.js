
const passport = require('passport')

const AuthName = 'external-db-authorization'
const CallbackRedirectOptions = {
  successReturnToOrRedirect: '/',
  failureRedirect: '/auth/login'
}

const initAuthenticationFrameworkWith = (authProvider) => {
  passport.use(AuthName, authProvider)
  passport.serializeUser((user, done) => done(null, user))
  passport.deserializeUser((obj, done) => done(null, obj))
}

const userAuthenticationHandler = passport.authenticate(AuthName)

const authenticatedUserHandler = passport.authenticate(AuthName, CallbackRedirectOptions)

const logoutUserHandler = (req, res) => {
  req.logout()
  res.redirect('/')
}

module.exports = { 
    initAuthenticationFrameworkWith, userAuthenticationHandler, authenticatedUserHandler, logoutUserHandler
}
