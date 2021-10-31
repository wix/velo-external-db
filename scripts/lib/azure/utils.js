const { randomInt } = require('../utils/utils')

const random = randomInt()

const provisionVariables = {
    resourceGroupName: `velo-resource-group-${random}`,
    virtualNetworkName: `velo-vnet-${random}`,
    subnetName: `velo-subnet-${random}`,
    appServicePlanName: `plan${random}`,
    keyVaultName:`key-vault-${random}`
}

const refFromKeyVault = (keyVaultName, secretName) => {
    return `@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=${secretName})`
}


module.exports = { provisionVariables, refFromKeyVault }