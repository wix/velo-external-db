const express = require('express')
const passport = require('passport')

let authService

const initAuthService = ( _authService ) => {
  authService = _authService
}

const createAuthRouter = () => {
  const router = express.Router()

  passport.use('external-db-authorization', authService)

  passport.serializeUser((user, done) => done(null, user))
  passport.deserializeUser((obj, done) => done(null, obj))


  router.get('/auth/login', passport.authenticate('external-db-authorization'))
  
  // TODO: disable this route when using GCP/AWS
  router.get('/auth/signup', (req, res, next) => {
    const user = { id: Math.random().toString(36) }

    req.login(user, err => {
      if (err) return next(err)

      res.redirect('/')
    })

  })

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
