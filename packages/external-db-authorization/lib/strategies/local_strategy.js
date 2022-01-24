const OAuth2Strategy = require('passport-oauth2')

class LocalStrategy {
  constructor() {
    this.options = {
        authorizationURL: '/auth/signup',
        clientID: 'clientID',
        clientSecret: 'clientSecret',
        tokenURL: '/oauth2/token'
    }
    return new OAuth2Strategy(this.options, this.verify)
    
  }

  verify(AccessToken, tokenSecret, profile, done) {
        done(null, profile)
  }

}

module.exports = { LocalStrategy }
