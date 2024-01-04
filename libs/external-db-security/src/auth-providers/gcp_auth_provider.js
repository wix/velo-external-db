const GoogleStrategy = require('passport-google-oauth20').Strategy

class GcpAuthProvider {
  constructor({ clientId, clientSecret, callbackUrl }) {
    this.options = {
      clientID: clientId,
      clientSecret,
      callbackURL: callbackUrl,
      scope: ['email', 'profile']
    }

    return new GoogleStrategy(this.options, this.verify)
  }

  verify(accessToken, tokenSecret, profile, done) {
        done(null, profile)
  }

}

module.exports = { GcpAuthProvider }
