const localStrategy = require('passport-local')

class LocalStrategy {
  constructor() {
    return new localStrategy(this.verify) 
  }

  verify(AccessToken, tokenSecret, profile, done) {
        done(null, profile)
  }

}

module.exports = { LocalStrategy }
