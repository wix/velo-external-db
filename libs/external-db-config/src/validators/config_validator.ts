import { IConfigValidator } from "@wix-velo/velo-external-db-types"
import { AuthorizationConfigValidator } from "./authorization_config_validator"
import { CommonConfigResponseExtended, CommonConfigValidator } from "./common_config_validator"

export class ConfigValidator {
    connectorValidator: IConfigValidator
    authValidator: AuthorizationConfigValidator
    commonValidator: CommonConfigValidator
    constructor(connectorValidator: any, authValidator: any, commonValidator: any) {
        this.connectorValidator = connectorValidator
        this.authValidator = authValidator
        this.commonValidator = commonValidator
    }

    readConfig() { 
        return { ...this.connectorValidator.readConfig(), ...this.commonValidator.readConfig(), authorization: this.authValidator.readConfig() }
    }

    configStatus() {
        const { missingRequiredSecretsKeys: missingRequiredConnectorEnvs } = this.connectorValidator.validate()
        const { valid: validAuthorization, message: authorizationMessage } = this.authValidator.validate()
        const { missingRequiredSecretsKeys: missingRequiredCommonEnvs, validType = true, validVendor = true } = (this.commonValidator.validate() as CommonConfigResponseExtended)

        const validConfig = missingRequiredConnectorEnvs.length === 0 && missingRequiredCommonEnvs.length === 0 && validType && validVendor

        let message
        
        if (missingRequiredConnectorEnvs.length || missingRequiredCommonEnvs.length) {
            message = `Missing props: ${[...missingRequiredConnectorEnvs, ...missingRequiredCommonEnvs].join(', ')}`
        }

        else if (!validVendor)
            message = 'Cloud type is not supported'

        else if(!validType)
            message = 'DB type is not supported'

        else
            message = 'External DB Config read successfully'
        return { validConfig, message, validAuthorization, authorizationMessage }
    }
}
