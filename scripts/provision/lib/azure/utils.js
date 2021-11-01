const { randomInt } = require('../utils/utils')

const random = randomInt()

const provisionVariables = {
    resourceGroupName: `velo-resource-group-${random}`,
    virtualNetworkName: `velo-vnet-${random}`,
    subnetName: `velo-subnet-${random}`,
    appServicePlanName: `plan${random}`,
    keyVaultName:`key-vault-${random}`
}

const refFromKeyVault = (keyVaultName, secretName) => `@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=${secretName})`

const DockerImage = 'DOCKER|veloex/velo-external-db:latest'

module.exports = { provisionVariables, refFromKeyVault, DockerImage }