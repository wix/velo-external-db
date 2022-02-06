const AzureAdOAuth2Strategy = require('passport-azure-ad-oauth2')

class AzureStrategy {
  constructor({ clientId, clientSecret, callbackUrl }) {
    this.options = {
      clientID: clientId,
      clientSecret: clientSecret,
      callbackURL: callbackUrl,
    }

    return new AzureAdOAuth2Strategy(this.options, this.verify)
  }

  verify(AccessToken, tokenSecret, profile, done) {
        done(null, profile)
  }

}

module.exports = { AzureStrategy }
