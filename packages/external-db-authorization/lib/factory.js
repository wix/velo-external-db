const authProviderFor = (vendor = '', cfg) => {
  switch (vendor.toLowerCase()) {
    case 'aws': {
      const { AwsStrategy } = require('./strategies/aws_strategy')
      return new AwsStrategy(cfg)
    }
    case 'gcp': {
      const { GcpStrategy } = require('./strategies/gcp_strategy')
      return new GcpStrategy(cfg)
    }

    case 'azure':
    case 'local':
    default: {
      const { LocalStrategy } = require('./strategies/local_strategy')
      
      return { authProvider: new LocalStrategy(cfg), isValidAuthService: false }  
    }      
  }
}

const initAuthProvider = async(vendor, config) => {

  const { auth: authConfig } = await config.readConfig()
  const authInformation = await config.configStatus()

  const authProvider = authProviderFor(vendor, authConfig)

  return { authProvider, authInformation }

}

module.exports = { initAuthProvider }
