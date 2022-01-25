const express = require('express')
const passport = require('passport')

let authStrategy

const initAuthService = ( _authStrategy ) => {
  authStrategy = _authStrategy
}

const createAuthRouter = () => {
  const router = express.Router()

  passport.use('external-db-authorization', authStrategy)

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
