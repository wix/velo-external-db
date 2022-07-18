import ConfigReader from './service/config_reader'
import CommonConfigReader from './readers/common_config_reader'
import StubConfigReader from './readers/stub_config_reader'
import AwsAuthorizationConfigReader from './readers/aws_authorization_config_reader'
import AuthorizationConfigReader from './readers/authorization_config_reader'
import * as aws from './readers/aws_config_reader'
import * as gcp from './readers/gcp_config_reader'
import * as azure from './readers/azure_config_reader'

const DefaultSecretId = 'VELO-EXTERNAL-DB-SECRETS'

export const create = () => {
  const common = new CommonConfigReader()
  const { vendor = '', type, secretId: _secretId , region } = common.readConfig()
  const secretId = _secretId || DefaultSecretId
  let internalConfigReader
  let authorizationConfigReader

  switch (vendor.toLowerCase()) {
    case 'aws': {
      authorizationConfigReader = new AwsAuthorizationConfigReader(region, secretId)
      switch(type) {
        case 'dynamodb':
          internalConfigReader = new aws.AwsDynamoConfigReader(region, secretId) 
          break
        case 'mongo':
          internalConfigReader = new aws.AwsMongoConfigReader(region, secretId)
          break
        default:
          internalConfigReader = new aws.AwsConfigReader(secretId, region)
      }      
    
    }
    break
      
    case 'gcp': {
      authorizationConfigReader = new AuthorizationConfigReader()
      switch (type) {
        case 'spanner':
          internalConfigReader = new gcp.GcpSpannerConfigReader()
          break
        case 'firestore':
          internalConfigReader = new gcp.GcpFirestoreConfigReader()
          break
        case 'google-sheet':
          internalConfigReader = new gcp.GcpGoogleSheetsConfigReader()
          break
        case 'mongo':
          internalConfigReader = new gcp.GcpMongoConfigReader()
          break
        case 'airtable':
          internalConfigReader = new gcp.GcpAirtableConfigReader()  
          break
        case 'bigquery':
          internalConfigReader = new gcp.GcpBigQueryConfigReader()
          break
        case 'mysql':
        case 'postgres':
          internalConfigReader = new gcp.GcpConfigReader()
          break
      }
    }
    break

    case 'azure': {
      authorizationConfigReader = new AuthorizationConfigReader()
      switch (type) {
        case 'spanner':
          internalConfigReader = new gcp.GcpSpannerConfigReader()
          break
        case 'firestore':
          internalConfigReader = new gcp.GcpFirestoreConfigReader()
          break
        case 'google-sheet':
          internalConfigReader = new gcp.GcpGoogleSheetsConfigReader()
          break
        case 'mongo':
          internalConfigReader = new gcp.GcpMongoConfigReader()
          break
        case 'airtable':
          internalConfigReader = new gcp.GcpAirtableConfigReader()
          break
        case 'dynamodb':
          internalConfigReader = new aws.AwsDynamoConfigReader(region, secretId) 
          break
        case 'bigquery':
          internalConfigReader = new gcp.GcpBigQueryConfigReader()
          break
        case 'mssql':
        case 'mysql':
        case 'postgres':
          internalConfigReader = new azure.AzureConfigReader()
          break
      }
    }
    break
  }

  return new ConfigReader(internalConfigReader || new StubConfigReader, common, authorizationConfigReader || new StubConfigReader)
}
