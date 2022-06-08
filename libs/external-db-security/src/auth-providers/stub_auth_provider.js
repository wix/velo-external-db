const localStrategy = require('passport-local')

class StubAuthProvider {
  constructor() {
    return new localStrategy(this.verify) 
  }

  verify(accessToken, tokenSecret, profile, done) {
        done(null, profile)
  }

}

module.exports = { StubAuthProvider }
