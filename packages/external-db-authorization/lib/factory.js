const strategyFor = (vendor = '', cfg) => {
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
      
      return new LocalStrategy(cfg)
    }      
  }
}

const createAuthService = async(vendor, config) => {
  const cfg = await config.readConfig()
  const configStatus = await config.configStatus()

  if (configStatus !== 'External DB Config read successfully') {
    return strategyFor('local')
  }
  
  return strategyFor(vendor, cfg)

}

module.exports = { createAuthService }
