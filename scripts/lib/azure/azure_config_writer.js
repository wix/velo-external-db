const { SecretClient } = require("@azure/keyvault-secrets");
const { KeyVaultManagementClient } = require("@azure/arm-keyvault");
const { SubscriptionClient } = require("@azure/arm-subscriptions");
const { DefaultAzureCredential } = require('@azure/identity')
const { NetworkManagementClient } = require('@azure/arm-network');

class ConfigWriter {
    constructor(credentials) {
        this.credentials =credentials
        this.azureCreds = new DefaultAzureCredential();
        this.keyVaultManagementClient = new KeyVaultManagementClient(this.azureCreds, credentials.subscriptionId)
        this.userObjectId = credentials.userObjectId
    }

    async writeConfig(secretId, dbCredentials, host, dbName, secretKey, provisionVariables, instanceName) {
        const { resourceGroupName, keyVaultName, subnetName, virtualNetworkName } = provisionVariables

        const client = new SubscriptionClient(this.azureCreds)

        const tenantId = (await client.tenants.list())[0].tenantId
        await this.createKeyVaultInstance(resourceGroupName, keyVaultName, tenantId, virtualNetworkName, subnetName, this.userObjectId)
            

        const KVUri = "https://" + keyVaultName + ".vault.azure.net";
        const secretClient = new SecretClient(KVUri, this.azureCreds);

        const config = {
            HOST: host,
            USER: `${dbCredentials.user}@${instanceName}`,
            PASSWORD: dbCredentials.passwd,
            DB: dbName,
            TYPE: 'mysql', //todo:replace,
            CLOUDVENDOR: 'azr',
            SECRETKEY:secretKey,            
        }

        await this.loadSecrets(secretClient, config)

        return;
    }

    async updateAccessPolicy({identity},provisionVariables){
        const {resourceGroupName, keyVaultName} = provisionVariables
        await this.keyVaultManagementClient.vaults.updateAccessPolicy(resourceGroupName, keyVaultName, 'add', {
            location: 'eastus',
            properties: {
                accessPolicies: [{
                    objectId: identity.principalId,
                    tenantId: identity.tenantId,
                    permissions: {secrets: ["get"]}
                }]
            }
        })
        
    }

    async createKeyVaultInstance(resourceGroupName, keyVaultName, tenantId, virtualNetworkName, subnetName, userObjectId) {
        const networkClient = new NetworkManagementClient(this.azureCreds,this.credentials.subscriptionId)
        const virtualNetwork = await networkClient.virtualNetworks.get(resourceGroupName, virtualNetworkName)

        const keyVault = await this.keyVaultManagementClient.vaults.beginCreateOrUpdate(resourceGroupName, keyVaultName, {
            "location": "eastus",
            properties: {
                "tenantId": tenantId,
                "sku": { "name": "standard" },
                "networkAcls": { "virtualNetworkRules": [{ "id": `${virtualNetwork.id}/subnets/${subnetName}` }] },
                "accessPolicies":
                    [
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

    async loadSecrets(secretClient, environmentVariables) {
        Object.keys(environmentVariables).forEach(async (secretName) => {
            await secretClient.setSecret(secretName, environmentVariables[secretName])
        })
        
        return;
    }
}

module.exports = ConfigWriter