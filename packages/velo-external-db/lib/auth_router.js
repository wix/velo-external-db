const express = require('express')
const passport = require('passport')

let authService

const initAuthService = ( _authService ) => {
  authService = _authService
}

const createAuthRouter = () => {
  // Disable the auth in tests
  if (process.env.NODE_ENV === 'test' ) {
    const router = express.Router()
    return router
  }
  
  const router = express.Router()

  passport.use('external-db-authorization', authService)

  passport.serializeUser((user, done) => done(null, user))
  passport.deserializeUser((obj, done) => done(null, obj))


  router.get('/auth/login', passport.authenticate('external-db-authorization'))

  router.get('/auth/callback', passport.authenticate('external-db-authorization', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/auth/login'
  }))

  router.get('/auth/logout', (req, res) => {
      req.logout()
      res.redirect('/')
  })

  return router

}




module.exports = { createAuthRouter, initAuthService }
