const { WebSiteManagementClientContext, WebApps, AppServicePlans } = require("@azure/arm-appservice");
const { startSpinnerWith, appServiceVariables } = require('./init')

// "@azure/arm-appservice": "^8.1.0",
//     "@azure/arm-keyvault": "^1.3.1",
//     "@azure/arm-mysql": "^3.4.0",
//     "@azure/arm-network": "^25.1.0",
//     "@azure/arm-resources": "^4.2.0",
//     "@azure/arm-sql": "^7.1.0",
//     "@azure/arm-subscriptions": "^3.1.1",
//     "@azure/graph": "^5.0.3",
//     "@azure/identity": "^1.4.0",
//     "@azure/keyvault-secrets": "^4.2.0",
//     "@azure/ms-rest-nodeauth": "^3.0.10",
//     "consola": "^2.15.3",
// "dotenv": "^10.0.0",

const createAppService = async (creds, subscriptionId, resourceGroupName, serverFarmId, webAppName, virtualNetwork, dockerImage) => {
    return new Promise(async (resolve, reject) => {
        try {
            const clientContext = await new WebSiteManagementClientContext(creds, subscriptionId)
            const webAppClient = new WebApps(clientContext);
            const _serverFarmId = serverFarmId ? serverFarmId : createAppServicePlan(clientContext)


            await startSpinnerWith("\tCreating webApp instance", () => createWebApp(webAppClient, resourceGroupName, webAppName, serverFarmId, dockerImage),
                "\tWebApp instance created")

            await startSpinnerWith("\tApplying Virtual network firewall rule", () => webAppClient.createOrUpdateSwiftVirtualNetworkConnectionWithCheck(resourceGroupName, webAppName, { "subnetResourceId": virtualNetwork.subnets[0].id }),
                "\tFireWall created successfully ! ")
            const webAppResponse = await webAppClient.get(resourceGroupName, webAppName)
            resolve({ webAppResponse, webAppClient })

        } catch (err) {
            console.log(err);
            reject(err)
        }
    })
}

const createWebApp = async (webAppClient, resourceGroupName, webAppName, serverFarmId, dockerImage) => {
    return new Promise(async (resolve, reject) => {
        try {
            const webApp = await webAppClient.beginCreateOrUpdate(resourceGroupName, webAppName, {
                location: 'eastus',
                reserved: true,
                serverFarmId,
                siteConfig: {
                    linuxFxVersion: dockerImage,
                },
                identity: {
                    "type": "SystemAssigned"
                }
            })
            await webApp.pollUntilFinished()
            resolve(webApp)
        } catch (e) {
            reject(e)
        }
    })
}
const loadEnviormentVariables = async (webAppClient, resourceGroupName, webAppName, keyVaultName) => {
    return new Promise(async (resolve, reject) => {
        try {
            const result =  await webAppClient.updateApplicationSettings(resourceGroupName, webAppName, {
                properties: appServiceVariables(keyVaultName)
            })
            resolve(result)
        }
        catch (e) {
            console.log(e);
            reject(e)
        }

    })
}

const createAppServicePlan = (clientContext) => {
    const appServicePlansClient = new AppServicePlans(clientContext)
    appServicePlansClient.beginCreateOrUpdate()
}
module.exports = { createAppService, loadEnviormentVariables };