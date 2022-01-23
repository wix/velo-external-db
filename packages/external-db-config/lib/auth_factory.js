const ConfigReader = require('./service/config_reader')
const CommonConfigReader = require('./readers/common_config_reader')
const StubConfigReader = require('./readers/stub_config_reader')
const { AwsAuthConfigReader } = require('./readers/aws_auth_config_reader')
const { GcpAuthConfigReader } = require('./readers/gcp_auth_config_reader')

const DefaultSecretId = 'VELO-EXTERNAL-DB-SECRETS'

const createAuthConfigReader = () => {
  const common = new CommonConfigReader()
  const { vendor, region, secretId } = common.readConfig()

  let internalConfigReader
  switch (vendor.toLowerCase()) {

    case 'aws':
      internalConfigReader = new AwsAuthConfigReader(secretId || DefaultSecretId, region)
      break
      
    case 'gcp':
      internalConfigReader = new GcpAuthConfigReader()
      break

    case 'azure':
      // TODO 
      break

  }

  return new ConfigReader(internalConfigReader || new StubConfigReader, common)
}

module.exports = { createAuthConfigReader }
