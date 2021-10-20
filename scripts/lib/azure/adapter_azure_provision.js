const { WebSiteManagementClientContext, WebApps, AppServicePlans } = require("@azure/arm-appservice");

class AdapterProvision {
    constructor(credentials, subscriptionId) {
        this.contextClient = new WebSiteManagementClientContext(credentials, subscriptionId)
        this.webAppClient = new WebApps(this.contextClient)
    }

    async createAdapter(name, resourceGroupName, region) {
        const serverFarm = await createAppServicePlan(resourceGroupName)

        const webApp = await this.webAppClient.beginCreateOrUpdate(resourceGroupName, name, {
            location: region, //'eastus'
            reserved: true,
            serverFarmId: serverFarm.id,
            siteConfig: {
                linuxFxVersion: 'DOCKER|veloex/velo-external-db:latest',
            },
            identity: {
                "type": "SystemAssigned"
            }
        })
        await webApp.pollUntilFinished()
        return (webApp)
    }

    async adapterStatus(webAppName, adapterCredentials) {
        const webAppResponse = await this.webAppClient.get(adapterCredentials.resourceGroupName, webAppName)

        return {
            available: webAppResponse.state === 'Running',
            serviceUrl: webAppResponse.defaultHostName,
            identity: webAppResponse.identity
        }
    }

    async preCreateAdapter() {

    }
    async postCreateAdapter(webAppName, adapterCredentials, keyVaultName, environmentVariables) {

        const status = await this.adapterStatus(webAppName, adapterCredentials)

        await createKeyVault(credentials, subscriptionId, adapterCredentials, keyVaultName, status.identity, environmentVariables)

        await loadEnviormentVariables(this.webAppClient, env.resourceGroupName, env.webAppName, env.keyVaultName)

    }
    async loadEnviormentVariables(resourceGroupName, webAppName, keyVaultName) {
        const result = await webAppClient.updateApplicationSettings(resourceGroupName, webAppName, {
            properties: appServiceVariables(keyVaultName)
        })
        resolve(result)
    }

    async createAppServicePlan(resourceGroupName) {
        const SERVICE_NAME = 'veloappserviceplan'
        const appServicePlansClient = new AppServicePlans(this.contextClient)
        await appServicePlansClient.beginCreateOrUpdate(resourceGroupName, SERVICE_NAME, {
            location: 'eastus', kind: 'linux', type: 'Microsoft.Web/serverfarms', reserved: true,
            sku: { name: 'P1V2', tier: 'PremiumV2', size: 'P1V2', family: 'Pv2', capacity: 1 }
        })
        return (await appServicePlansClient.get(resourceGroupName, SERVICE_NAME))

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