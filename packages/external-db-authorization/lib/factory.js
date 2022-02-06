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

    case 'azure': {
      const { AzureStrategy } = require('./strategies/azure_strategy')
      return new  AzureStrategy(cfg)
    }

    default: {
      const { LocalStrategy } = require('./strategies/local_strategy')
      return new LocalStrategy(cfg)
    }      
  }
}

const initAuthProvider = async(vendor, config) => {

  const { auth: authConfig } = await config.readConfig()
  const authInformation = await config.configStatus()

  if (!authInformation.validAuthConfig) {
    return { authProvider: authProviderFor(), authInformation }
  }

  return { authProvider: authProviderFor(vendor, authConfig), authInformation }
}

module.exports = { initAuthProvider }
