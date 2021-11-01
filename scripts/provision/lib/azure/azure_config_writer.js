const { SecretClient } = require('@azure/keyvault-secrets')
const { KeyVaultManagementClient } = require('@azure/arm-keyvault')
const { SubscriptionClient } = require('@azure/arm-subscriptions')
const { DefaultAzureCredential } = require('@azure/identity')
const { NetworkManagementClient } = require('@azure/arm-network')

class ConfigWriter {
    constructor(credentials, region) {
        this.credentials = credentials
        this.azureCreds = new DefaultAzureCredential()
        this.keyVaultManagementClient = new KeyVaultManagementClient(this.azureCreds, credentials.subscriptionId)
        this.networkManagementClient = new NetworkManagementClient(this.azureCreds, credentials.subscriptionId)
        this.subscriptionClient = new SubscriptionClient(this.azureCreds)
        this.userObjectId = credentials.userObjectId
        this.region = region
    }

    async writeConfig(secretId, dbCredentials, host, connectionName, dbName, secretKey, provisionVariables, instanceName) {
        const { resourceGroupName, keyVaultName, subnetName, virtualNetworkName } = provisionVariables
        await this.createKeyVaultInstance(resourceGroupName, keyVaultName, virtualNetworkName, subnetName, this.userObjectId)

        await this.writeConfigurationToKeyVault(keyVaultName, dbCredentials, dbName, secretKey, host, instanceName)
    }

    async writeConfigurationToKeyVault(keyVaultName, dbCredentials, dbName, secretKey, host, instanceName) {
        const secretClient = new SecretClient(`https://${keyVaultName}.vault.azure.net`, this.azureCreds)

        const config = {
            HOST: host,
            USER: `${dbCredentials.user}@${instanceName}`,
            PASSWORD: dbCredentials.passwd,
            DB: dbName,
            TYPE: 'mysql', //todo:replace to engine or load it not as secret,
            CLOUDVENDOR: 'azr',
            SECRETKEY: secretKey,
        }

        Promise.all(Object.keys(config)
                          .map(async secretName => 
                                await secretClient.setSecret(secretName, config[secretName])
                              )
        )
    }
    
    async updateAccessPolicy({identity}, provisionVariables) {
        const {resourceGroupName, keyVaultName} = provisionVariables
        await this.keyVaultManagementClient
                  .vaults
                  .updateAccessPolicy(resourceGroupName, keyVaultName, 'add', {
                        location: this.region,
                        properties: {
                            accessPolicies: [{
                                objectId: identity.principalId,
                                tenantId: identity.tenantId,
                                permissions: {secrets: ['get']}
                            }]
                        }
                  })
    }

    async createKeyVaultInstance(resourceGroupName, keyVaultName, virtualNetworkName, subnetName, userObjectId) {
        const tenantId = (await this.subscriptionClient.tenants.list())[0].tenantId

        const virtualNetwork = await this.networkClient
                                         .virtualNetworks
                                         .get(resourceGroupName, virtualNetworkName)
                                         


        const keyVault = await this.keyVaultManagementClient.vaults.beginCreateOrUpdate(resourceGroupName, keyVaultName, {
            location: this.region,
            properties: {
                tenantId: tenantId,
                sku: { name: 'standard' },
                networkAcls: { virtualNetworkRules: [{ id: `${virtualNetwork.id}/subnets/${subnetName}` }] },
                accessPolicies:
                    [
                        {
                            objectId: userObjectId, tenantId: tenantId,
                            permissions: { secrets: ['backup', 'delete', 'set', 'list', 'get'] }
                        }
                    ]
            }
        })
        await keyVault.pollUntilFinished()
        return keyVault
    }
}

module.exports = ConfigWriter