const { ResourceManagementClientContext, ResourceGroups } = require('@azure/arm-resources')
const { DefaultAzureCredential } = require('@azure/identity')
const VirtualNetwork = require ('./azure_network')
const factory = require('./db/factory')

class DbProvision {
    constructor(credentials, region, engine) {
        this.azureCreds = new DefaultAzureCredential()
        this.credentials = credentials
        this.engineClient = factory.clientFor(engine)
        this.contextClient = this.engineClient.contextClient(this.azureCreds, this.credentials.subscriptionId)
        this.serversClient = this.engineClient.serversClient(this.contextClient)
        this.virtualNetworkService = new VirtualNetwork(credentials, this.engineClient, region)
        this.region = region
    }

    async createDb({ name, credentials, resourceGroupName }) {
        this.instance = await this.serversClient
                                  .beginCreate(resourceGroupName, name, {
                                        properties: {
                                            createMode: 'Default', administratorLogin: credentials.user,
                                            administratorLoginPassword: credentials.passwd, sslEnforcement: 'Disabled'
                                        },
                                        location: this.region,
                                        sku: { tier: 'GeneralPurpose', name: 'GP_Gen5_4' }
                                  })
                                  .then(async instance => await instance.pollUntilFinished())
                                  .catch(console.log)
    }

    async dbStatusAvailable(name, provisionVariables) {
        console.log('##')
        return await this.serversClient
                         .get(provisionVariables.resourceGroupName, name)
                         .then(instance => ({
                                instanceName: name,
                                host: instance.fullyQualifiedDomainName,
                                available: instance.userVisibleState === 'Ready'
                            })
                         )
                         .catch(() => { console.log('~~'); ({ available: false })})
    }

    async preCreateDb({ resourceGroupName, virtualNetworkName, subnetName }) {
        await this.createResourceGroup(resourceGroupName)
        await this.virtualNetworkService
                  .createVirtualNetwork(resourceGroupName, virtualNetworkName, subnetName)
    }

    async postCreateDb(engine, dbName, status, dbCredentials, { resourceGroupName, virtualNetworkName }, instanceName) {
        await this.engineClient
                  .createInitDb(resourceGroupName, instanceName, dbName, this.contextClient)
        await this.createVirtualNetworkRule(instanceName, resourceGroupName, virtualNetworkName)
    }

    async createResourceGroup(resourceGroupName) {
        const resourceGroupsClient = new ResourceGroups(new ResourceManagementClientContext(this.azureCreds, this.credentials.subscriptionId))
        const resourceGroup = await resourceGroupsClient.createOrUpdate(resourceGroupName, { location: this.region })
        return resourceGroup
    }

    async createVirtualNetworkRule(serverName, resourceGroupName, virtualNetworkName) {
        const virtualNetwork = await this.virtualNetworkService
                                         .getVirtualNetwork(resourceGroupName, virtualNetworkName)
        await this.engineClient
                  .createVirtualNetworkRule(serverName, resourceGroupName, virtualNetwork, this.contextClient)
    }
}

module.exports = DbProvision
