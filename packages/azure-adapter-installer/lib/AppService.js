const { WebSiteManagementClientContext, WebApps } = require("@azure/arm-appservice");

const createAppService = async (creds, subscriptionId, resourceGroupName, serverFarmId, webAppName, virtualNetwork) => {
    return new Promise(async (resolve, reject) => {
        try {
            const clientContext = await new WebSiteManagementClientContext(creds, subscriptionId)
            const webAppClient = new WebApps(clientContext);


            const webApp = await webAppClient.beginCreateOrUpdate(resourceGroupName, webAppName, {
                location: 'eastus',
                reserved: true,
                serverFarmId,
                siteConfig: {
                    linuxFxVersion: 'DOCKER|veloadapteracr.azurecr.io/velo-adapter-azure:v2.1',
                },
                identity: {
                    "type": "SystemAssigned"
                }
            })
            await webApp.pollUntilFinished()
            console.log("Webapp created");

            await webAppClient.createOrUpdateSwiftVirtualNetworkConnectionWithCheck(resourceGroupName, webAppName, { "subnetResourceId": virtualNetwork.subnets[0].id })
            console.log("firewall rule created ");
            const webAppResponse = await webAppClient.get(resourceGroupName, webAppName)
            resolve({ webAppResponse, webAppClient })

        } catch (err) {
            reject(err)
        }
    })
}
module.exports = { createAppService };