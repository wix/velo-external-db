
const createAuthService = async(vendor, config) => {
  const cfg = await config.readConfig()

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
    default: {
      const { LocalStrategy } = require('./strategies/local_strategy')
      
      return new LocalStrategy(cfg)
    }      
  }

}

module.exports = { createAuthService }
