const GoogleStrategy = require('passport-google-oauth20').Strategy

class GcpStrategy {
  constructor({ clientId, clientSecret, callbackUrl }) {
    this.options = {
      clientID: clientId,
      clientSecret: clientSecret,
      callbackURL: callbackUrl,
      scope: ['email', 'profile']
    }

    return new GoogleStrategy(this.options, this.verify)
  }

  verify(AccessToken, tokenSecret, profile, done) {
        done(null, profile)
  }

}

module.exports = { GcpStrategy }
