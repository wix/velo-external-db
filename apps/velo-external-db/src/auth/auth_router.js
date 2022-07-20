const express = require('express')
const auth = require('./auth_request_handlers')

let authProvider

const initAuthService = ( _authProvider ) => {
  authProvider = _authProvider
}

const createAuthRouter = () => {
  const router = express.Router()

  auth.initAuthenticationFrameworkWith(authProvider)

  router.get('/auth/login', auth.userAuthenticationHandler) 

  router.get('/auth/callback', auth.authenticatedUserHandler)

  router.get('/auth/logout', auth.logoutUserHandler)
  
  return router
  
}

module.exports = { createAuthRouter, initAuthService }
