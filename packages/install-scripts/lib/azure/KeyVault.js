
const { SecretClient } = require("@azure/keyvault-secrets");
const { KeyVaultManagementClient } = require("@azure/arm-keyvault");
const { SubscriptionClient } = require("@azure/arm-subscriptions");
const { startSpinnerWith } = require('./init')
const createKeyVault = async (creds, subscriptionId, resourceGroupName, keyVaultName, webAppIdentity, environmentVariables, virtualNetworkId, userObjectId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const client = new SubscriptionClient(creds)
            const tenantId = (await client.tenants.list())[0].tenantId
            const keyvaultClient = new KeyVaultManagementClient(creds, subscriptionId)

            const keyVault = await startSpinnerWith("\tCreating KeyVault instance", () => createKeyVaultInstance(keyvaultClient, resourceGroupName, keyVaultName, tenantId, virtualNetworkId, webAppIdentity, userObjectId),
                "\tKeyVault instance created ")

            const KVUri = "https://" + keyVaultName + ".vault.azure.net";
            const secretClient = new SecretClient(KVUri, creds);

            await startSpinnerWith("Loading secrets", () => loadSecrets(secretClient, environmentVariables), "Secrets loaded into KeyVault")
            resolve(keyVault)
        } catch (e) {
            console.lo(e);
            reject(e)
        }
    })
}
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
const createKeyVaultInstance = (keyvaultClient, resourceGroupName, keyVaultName, tenantId, virtualNetworkId, webAppIdentity, userObjectId) => {
    return new Promise(async (resolve, reject) => {
        try {
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
            await keyVault.pollUntilFinished()
            resolve(keyVault)
        }
        catch (e) {
            console.log(e);
            reject(e)
        }
    })
}

const loadSecrets = (secretClient, environmentVariables) => {
    return new Promise(async (resolve, reject) => {
        try {
            Object.keys(environmentVariables).forEach(async (secretName) => {
                await secretClient.setSecret(secretName, environmentVariables[secretName])
            })
            sleep(15000)
            resolve("loaded successfully")
        } catch (e) {
            console.log(e);
            reject(e)
        }
    })

}
module.exports = { createKeyVault }
