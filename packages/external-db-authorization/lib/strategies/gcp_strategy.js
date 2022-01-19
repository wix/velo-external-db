const GoogleStrategy = require('passport-google-oauth20').Strategy

class GcpStrategy {
  constructor({ clientID, clientSecret, callbackURL }) {
    this.options = {
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile']
    }

    return new GoogleStrategy(this.options, this.verify)
  }

  verify(AccessToken, tokenSecret, profile, done) {
        done(null, profile)
  }

}

module.exports = { GcpStrategy }
