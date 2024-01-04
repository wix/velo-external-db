const AzureAdOAuth2Strategy = require('passport-azure-ad-oauth2')

class AzureAuthProvider {
  constructor({ clientId, clientSecret, callbackUrl }) {
    this.options = {
      clientID: clientId,
      clientSecret,
      callbackURL: callbackUrl,
    }

    return new AzureAdOAuth2Strategy(this.options, this.verify)
  }

  verify(accessToken, tokenSecret, profile, done) {
        done(null, profile)
  }

}

module.exports = { AzureAuthProvider }
