const { WebSiteManagementClientContext, WebApps, AppServicePlans } = require("@azure/arm-appservice")
const { DefaultAzureCredential } = require('@azure/identity')
const { refFromKeyVault } = require('./utils')
const { NetworkManagementClient } = require('@azure/arm-network')

class AdapterProvision {
    constructor(credentials) {
        this.azureCreds = new DefaultAzureCredential();
        this.credentials = credentials
        this.contextClient = new WebSiteManagementClientContext(this.azureCreds, credentials.subscriptionId)
        this.webAppClient = new WebApps(this.contextClient)
        this.networkClient = new NetworkManagementClient(this.azureCreds, this.credentials.subscriptionId)
    }

    async createAdapter(name, engine, secretId, secrets, { resourceGroupName, virtualNetworkName, appServicePlanName}) {
        const serverFarm = await this.createAppServicePlan(resourceGroupName, appServicePlanName)

        const webApp = await this.webAppClient.beginCreateOrUpdate(resourceGroupName, name,
                                                                   {
                                                                       location: 'eastus', //region
                                                                       reserved: true,
                                                                       serverFarmId: serverFarm.id,
                                                                       siteConfig: {
                                                                           linuxFxVersion: 'DOCKER|veloex/velo-external-db:latest',
                                                                       },
                                                                       identity: {
                                                                           type: 'SystemAssigned'
                                                                       }
        })
        await webApp.pollUntilFinished() //wait here or in adapterStatus?
        await this.connectToVirtualNetwork(resourceGroupName, name, virtualNetworkName)
        return { webApp }
    }

    async connectToVirtualNetwork(resourceGroupName, webAppName, virtualNetworkName){
        const virtualNetwork = await this.networkClient.virtualNetworks.get(resourceGroupName, virtualNetworkName)
        return await this.webAppClient.createOrUpdateSwiftVirtualNetworkConnectionWithCheck(resourceGroupName, webAppName, { subnetResourceId: virtualNetwork.subnets[0].id })
    }

    async adapterStatus(webAppName, provisionVariables) {
        const webAppResponse = await this.webAppClient.get(provisionVariables.resourceGroupName, webAppName)

        return {
            available: webAppResponse.state === 'Running',
            serviceUrl: webAppResponse.defaultHostName,
            identity: webAppResponse.identity
        }
    }

    async postCreateAdapter(webAppName, provisionVariables) {
        const { keyVaultName, resourceGroupName } = provisionVariables

        await this.loadEnviormentVariables(resourceGroupName, webAppName, keyVaultName)
    }

    async loadEnviormentVariables(resourceGroupName, webAppName, keyVaultName) {
        const result = await this.webAppClient.updateApplicationSettings(resourceGroupName, webAppName, {
            properties: appServiceVariables(keyVaultName)
        })
        return result
    }

    async createAppServicePlan(resourceGroupName, appServicePlanName) {
        const appServicePlansClient = new AppServicePlans(this.contextClient)
        await appServicePlansClient.beginCreateOrUpdate(resourceGroupName, appServicePlanName, {
            location: 'eastus', kind: 'linux', type: 'Microsoft.Web/serverfarms', reserved: true,
            sku: { name: 'P1V2', tier: 'PremiumV2', size: 'P1V2', family: 'Pv2', capacity: 1 }
        })
        return (await appServicePlansClient.get(resourceGroupName, appServicePlanName))

    }
}

const appServiceVariables = (keyVaultName) => {
    return {
        DB: refFromKeyVault(keyVaultName, 'DB'),
        HOST: refFromKeyVault(keyVaultName, 'HOST'),
        PASSWORD: refFromKeyVault(keyVaultName, 'PASSWORD'),
        TYPE: refFromKeyVault(keyVaultName, 'TYPE'),
        CLOUD_VENDOR: refFromKeyVault(keyVaultName, 'CLOUDVENDOR'),
        SECRET_KEY: refFromKeyVault(keyVaultName, 'SECRETKEY'),
        USER: refFromKeyVault(keyVaultName, 'USER'),
        PORT: refFromKeyVault(keyVaultName, 'PORT'),
    }
}


module.exports = AdapterProvision