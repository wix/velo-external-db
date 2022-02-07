const strategyFor = (vendor = '', cfg) => {
  switch (vendor.toLowerCase()) {
    case 'aws': {
      const { AwsAuthProvider } = require('./auth-providers/aws_auth_provider')
      return { authProvider: new AwsAuthProvider(cfg), isValidAuthProvider: true }
    
    }
    case 'gcp': {
      const { GcpAuthProvider } = require('./auth-providers/gcp_auth_provider.js')
      return { authProvider: new GcpAuthProvider(cfg), isValidAuthProvider: true } 
    }

    case 'azure': {
      const { AzureAuthProvider } = require('./auth-providers/azure_auth_provider')
      return { authProvider: new  AzureAuthProvider(cfg), isValidAuthProvider: true } 
    }

    default: {
      const { StubAuthProvider } = require('./auth-providers/stub_auth_provider')
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
