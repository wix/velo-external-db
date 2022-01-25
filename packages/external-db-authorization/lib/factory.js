const strategyFor = (vendor = '', cfg) => {
  switch (vendor.toLowerCase()) {
    case 'aws': {
      const { AwsStrategy } = require('./strategies/aws_strategy')
      
      return { authService: new AwsStrategy(cfg), validAuthService: true }
    
    }
    case 'gcp': {
      const { GcpStrategy } = require('./strategies/gcp_strategy')

      return { authService: new GcpStrategy(cfg), validAuthService: true } 
    }

    case 'azure':
    case 'local':
    default: {
      const { LocalStrategy } = require('./strategies/local_strategy')
      
      return { authService: new LocalStrategy(cfg), validAuthService: false }  
    }      
  }
}

const createAuthService = async(vendor, config) => {
  const cfg = await config.readConfig()
  const configStatus = await config.configStatus()

  // Change it when there will be a new configStatus function 
  if (configStatus !== 'External DB Config read successfully') {
    return strategyFor('local')
  }
  
  return strategyFor(vendor, cfg)

}

module.exports = { createAuthService }
