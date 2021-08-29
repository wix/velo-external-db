
const { SecretClient } = require("@azure/keyvault-secrets");
const { KeyVaultManagementClient } = require("@azure/arm-keyvault");
const { SubscriptionClient } = require("@azure/arm-subscriptions");

const createKeyVault = async (creds, subscriptionId, resourceGroupName, keyVaultName, webAppIdentity, environmentVariables, virtualNetworkId, userObjectId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const client = new SubscriptionClient(creds)
            const a = (await client.tenants.list())
            const tenantId = (await client.tenants.list())[0].tenantId
            const keyvaultClient = new KeyVaultManagementClient(creds, subscriptionId)
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
                            //TODO - figure out how to get my logged in user objectId on runtime
                        ]
                }
            })
            console.log("KeyVault created successfully! ");

            const KVUri = "https://" + keyVaultName + ".vault.azure.net";

            const secretClient = new SecretClient(KVUri, creds);
            console.log("Loading secrets... ");
            Object.keys(environmentVariables).forEach(async (secretName) => {
                await secretClient.setSecret(secretName, environmentVariables[secretName])
            })
            await keyVault.pollUntilFinished()
            sleep(15000)
            console.log("Secrets loaded successfully into KeyVault! ");
            resolve(keyVault)
        } catch (e) {
            reject(e)
        }
    })
}
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

module.exports = { createKeyVault }
