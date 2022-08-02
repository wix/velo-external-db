import AuthorizationConfigReader from './readers/authorization_config_reader'
import AwsAuthorizationConfigReader from './readers/aws_authorization_config_reader'
import StubConfigReader from './readers/stub_config_reader'

export interface IConfigReader {
    readConfig(): any
    readExternalAndLocalConfig?(): any
    readExternalConfig?(): any
}

export type IAuthorizationConfigReader = AuthorizationConfigReader | StubConfigReader | AwsAuthorizationConfigReader