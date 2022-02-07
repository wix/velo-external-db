const strategyFor = (vendor = '', cfg) => {
  switch (vendor.toLowerCase()) {
    case 'aws': {
      const { AwsAuthProvider } = require('./authProviders/aws_auth_provider')
      return { authProvider: new AwsAuthProvider(cfg), isValidAuthProvider: true }
    
    }
    case 'gcp': {
      const { GcpAuthProvider } = require('./authProviders/gcp_auth_provider.js')
      return { authProvider: new GcpAuthProvider(cfg), isValidAuthProvider: true } 
    }

    case 'azure': {
      const { AzureAuthProvider } = require('./authProviders/azure_auth_provider')
      return { authProvider: new  AzureAuthProvider(cfg), isValidAuthProvider: true } 
    }

    default: {
      const { StubAuthProvider } = require('./authProviders/stub_auth_provider')
      return { authProvider: new StubAuthProvider(), isValidAuthProvider: false }
    }      
  }
}

const createAuthProviderFor = async(vendor, config) => {
  const { auth: authConfig } = await config.readConfig()
  const { validAuthConfig } = await config.configStatus()

  if (!validAuthConfig) {
    return strategyFor('stub')
  }

  return strategyFor(vendor, authConfig)
}

module.exports = { createAuthProviderFor }
