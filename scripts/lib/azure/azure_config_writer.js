const { SecretClient } = require("@azure/keyvault-secrets");
const { KeyVaultManagementClient } = require("@azure/arm-keyvault");
const { SubscriptionClient } = require("@azure/arm-subscriptions");


class ConfigWriter {
    constructor(credentials, subscriptionId) {
        this.keyVaultManagementClient = new KeyVaultManagementClient(credentials, subscriptionId)
    }

    async writeConfig(credentials, resourceGroupName, keyVaultName, webAppIdentity, environmentVariables, virtualNetworkId, userObjectId) {
        const client = new SubscriptionClient(credentials)
        const tenantId = (await client.tenants.list())[0].tenantId
        const keyVault = await createKeyVaultInstance(resourceGroupName, keyVaultName, tenantId, virtualNetworkId, webAppIdentity, userObjectId)
        
        const KVUri = "https://" + keyVaultName + ".vault.azure.net";
        const secretClient = new SecretClient(KVUri, credentials);
        
        await loadSecrets(secretClient, environmentVariables)

        return ; 
    }

    async createKeyVaultInstance(resourceGroupName, keyVaultName, tenantId, virtualNetworkId, webAppIdentity, userObjectId) {
        const keyVault = await keyvaultClient.vaults.beginCreateOrUpdate(resourceGroupName, keyVaultName, {
            "location": "eastus",
            properties: {
                "tenantId": tenantId,
                "sku": { "name": "standard" },
                "networkAcls": { "virtualNetworkRules": [{ "id": virtualNetworkId }] },
                "accessPolicies":
                    [
                        {
                            "objectId": webAppIdentity.principalId, "tenantId": webAppIdentity.tenantId,
                            "permissions": { "secrets": ["get"] }
                        },
                        {
                            "objectId": userObjectId, "tenantId": tenantId,
                            "permissions": { "secrets": ["backup", "delete", "set", "list", "get"] }
                        }

                    ]
            }
        })
        await keyVault.pollUntilFinished()
        return keyVault
    }
    
    async loadSecrets (secretClient, environmentVariables) {
        Object.keys(environmentVariables).forEach(async (secretName) => {
            await secretClient.setSecret(secretName, environmentVariables[secretName])
        })
        sleep(15000)
        return ;
    }
}

module.exports = ConfigWriter