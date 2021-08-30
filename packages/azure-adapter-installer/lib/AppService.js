const { WebSiteManagementClientContext, WebApps } = require("@azure/arm-appservice");
const { startSpinnerWith, appServiceVariables } = require('./init')

const createAppService = async (creds, subscriptionId, resourceGroupName, serverFarmId, webAppName, virtualNetwork, dockerImage) => {
    return new Promise(async (resolve, reject) => {
        try {
            const clientContext = await new WebSiteManagementClientContext(creds, subscriptionId)
            const webAppClient = new WebApps(clientContext);

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
module.exports = { createAppService, loadEnviormentVariables };