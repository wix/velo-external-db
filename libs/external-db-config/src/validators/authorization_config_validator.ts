import { EmptyRoleConfig, configPattern, collectionConfigPattern } from '../utils/config_utils'
import * as Avj from 'ajv'
import { RoleConfig } from '@wix-velo/velo-external-db-types'
const ajv = new Avj()

export class AuthorizationConfigValidator {
  config: any
  configValidator: Avj.ValidateFunction
  collectionValidator: Avj.ValidateFunction
  constructor(config: any) {
    this.config = config || EmptyRoleConfig

    this.configValidator = ajv.compile(configPattern)
    this.collectionValidator = ajv.compile(collectionConfigPattern)
  }

  readConfig(): RoleConfig {
    const { roleConfig } = this.config
    const { collectionPermissions } = roleConfig && roleConfig.collectionPermissions ? roleConfig : EmptyRoleConfig

    return collectionPermissions.filter((collection: any) => this.collectionValidator(collection))
  }

  validate() {
    const { roleConfig } = this.config
    
    const valid = this.configValidator(roleConfig) as boolean
    let message 
    
    if (!this.config || !this.config.roleConfig)  
      message = 'Permissions config not defined, using default'
    else if (!valid && this.configValidator.errors)
      message = this.configValidator.errors.map(err => (`Error in ${err.dataPath}: ${err.message}`)).join(', ')
    else 
      message = 'Permissions config read successfully'

    return { valid, message }
  }
}
