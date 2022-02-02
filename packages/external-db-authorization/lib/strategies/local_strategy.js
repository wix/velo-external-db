const OAuth2Strategy = require('passport-oauth2')
class LocalStrategy {
  constructor({ clientDomain, clientId, clientSecret, callbackUrl, passReqToCallback }) {
    this.options = {
      authorizationURL: `${clientDomain}/authorize`,
      tokenURL: `${clientDomain}/token`,
      callbackURL: callbackUrl,
      clientID: clientId,
      clientSecret,
      passReqToCallback,
      scope: [''],
      state: [],
  } 
    return new OAuth2Strategy(this.options, this.verify)
  }
  
  verify(AccessToken, tokenSecret, profile, done) {
        done(null, profile)
  }

}

module.exports = { LocalStrategy }