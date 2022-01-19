const OAuth2Strategy = require('passport-oauth2')
const { CognitoIdentityProviderClient, GetUserCommand } = require('@aws-sdk/client-cognito-identity-provider')


class AwsStrategy {
  constructor({ clientDomain, clientID, clientSecret, callbackURL, passReqToCallback }) {

    this.options = {
        authorizationURL: `${clientDomain}/oauth2/authorize`,
        clientID,
        clientSecret,
        callbackURL,
        passReqToCallback,
        tokenURL: `${clientDomain}/oauth2/token`
    }

    return new OAuth2Strategy(this.options, this.verify)
  }

  verify(accessToken, tokenSecret, _profile, done) {
    const cognitoClient = new CognitoIdentityProviderClient()
    const command = new GetUserCommand({ AccessToken: accessToken })

    cognitoClient.send(command).then( userData => {
      const profile = userData.UserAttributes.reduce( (attribute, acc) => {
        acc[attribute.Name] = attribute.Value
        return acc
      }, {})
  
      profile.username = userData.Username
        
      done(null, profile)
    }).catch( err => done(err, null))

  }

  
}

module.exports = { AwsStrategy }
