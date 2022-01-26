const strategyFor = (vendor = '', cfg) => {
  switch (vendor.toLowerCase()) {
    case 'aws': {
      const { AwsStrategy } = require('./strategies/aws_strategy')
      
      return { authStrategy: new AwsStrategy(cfg), isValidAuthService: true }
    
    }
    case 'gcp': {
      const { GcpStrategy } = require('./strategies/gcp_strategy')

      return { authStrategy: new GcpStrategy(cfg), isValidAuthService: true } 
    }

    case 'azure':
    case 'local':
    default: {
      const { LocalStrategy } = require('./strategies/local_strategy')
      
      return { authStrategy: new LocalStrategy(cfg), isValidAuthService: false }  
    }      
  }
}

const createAuthService = async(vendor, config) => {

  const { auth: authConfig } = await config.readConfig()
  const { validAuthConfig } = await config.configStatus()

  if (!validAuthConfig) 
    return strategyFor('local')
  
  return strategyFor(vendor, authConfig)

}

module.exports = { createAuthService }
