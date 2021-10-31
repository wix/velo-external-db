const { ResourceManagementClientContext, ResourceGroups } = require('@azure/arm-resources');
const { DefaultAzureCredential } = require('@azure/identity')
const VirtualNetwork = require ('./azure_vnet')
const factory = require('./db/factory')

class DbProvision {
    constructor(credentials, region, engine) { //todo : get here region and transfer it to azure region
        this.azureCreds = new DefaultAzureCredential();
        this.credentials = credentials
        this.engine = factory.clientFor(engine)
        this.contextClient = this.engine.contextClient(this.azureCreds, this.credentials.subscriptionId)
        this.serversClient = this.engine.serversClient(this.contextClient)
        this.virtualNetworkService = new VirtualNetwork(credentials, this.engine)
    }

    async createDb({ name, credentials, resourceGroupName }) {
        await this.serversClient.beginCreate(resourceGroupName, name, {
            properties: {
                createMode: 'Default', administratorLogin: credentials.user,
                administratorLoginPassword: credentials.passwd, sslEnforcement: 'Disabled'
            },
            location: 'eastus', sku: { tier: 'GeneralPurpose', name: 'GP_Gen5_4' }
        }).catch( console.log )
    }

    async dbStatusAvailable(name, provisionVariables) {
        return await this.serversClient.get(provisionVariables.resourceGroupName, name)
                                       .then(instance => ({
                                           instanceName: name,
                                           host: instance.fullyQualifiedDomainName,
                                           available: instance.userVisibleState === 'Ready'
                                       }))
                                       .catch(() => ({ available: false }))
    }

    async preCreateDb(provisionVariables) {
        const { resourceGroupName, virtualNetworkName, subnetName } = provisionVariables
        await this.createResourceGroup(resourceGroupName)
        await this.virtualNetworkService.createVirtualNetwork(resourceGroupName, virtualNetworkName, subnetName)
    }

    async postCreateDb(engine, dbName, status, dbCredentials, provisionVariables, instanceName) {
        await this.engine.createInitDb(provisionVariables.resourceGroupName, instanceName,dbName, this.contextClient)
        await this.createVirtualNetworkRule(instanceName, provisionVariables.resourceGroupName)
    }

    async createResourceGroup(resourceGroupName) {
        const resourceGroupsClient = new ResourceGroups(new ResourceManagementClientContext(this.azureCreds, this.credentials.subscriptionId));
        const resourceGroup = await resourceGroupsClient.createOrUpdate(resourceGroupName, { location: 'eastus' })
        return resourceGroup
    }

    async createVirtualNetworkRule(serverName, resourceGroupName) {
        const virtualNetwork = this.virtualNetworkService
                                   .getVirtualNetwork(resourceGroupName, virtualNetworkName)
        this.engine.createVirtualNetworkRule(serverName, resourceGroupName, virtualNetwork)
    }
}

module.exports = DbProvision