const { ResourceManagementClientContext, ResourceGroups } = require('@azure/arm-resources');
const { DefaultAzureCredential } = require('@azure/identity')
const VirtualNetwork = require ('./azure_vnet')
const factory = require('./db/factory')

class DbProvision {
    constructor(credentials, region, engine) { //todo : get here region and transfer it to azure region
        this.azureCreds = new DefaultAzureCredential();
        this.credentials = credentials
        this.engine = factory.clientFor(engine)
        this.managementClient = this.engine.managementClient(this.azureCreds, this.credentials.subscriptionId)
        this.contextClient = this.engine.contextClient(this.azureCreds, this.credentials.subscriptionId)
        this.serversClient = this.engine.serversClient(this.contextClient)
        this.VirtualNetworkService = new VirtualNetwork(credentials, this.engine)
    }


    async createDb({ name, credentials, resourceGroupName }) {
        try {
            const response = await this.serversClient.beginCreate(resourceGroupName, name, {
                properties:
                {
                    createMode: 'Default', administratorLogin: credentials.user,
                    administratorLoginPassword: credentials.passwd, sslEnforcement: 'Disabled'
                },
                location: 'eastus', sku: { tier: 'GeneralPurpose', name: 'GP_Gen5_4' }
            })

            response.pollUntilFinished() // wait here or in dbStatusAvailable?
            return true;
        }
        catch (e) {
            console.log(e);
            return false
        }
    }

    async dbStatusAvailable(name, provisionVariables) {
        try {
            const instance = await this.serversClient.get(provisionVariables.resourceGroupName, name)
            return {
                instanceName: name,
                host: instance.fullyQualifiedDomainName,
                available: instance.userVisibleState === 'Ready'
            }
        } catch (e) {
            return { available: false }
        }
    }


    async preCreateDb(provisionVariables) {
        const { resourceGroupName, virtualNetworkName, subnetName } = provisionVariables
        await this.createResourceGroup(resourceGroupName)
        await this.VirtualNetworkService.createVirtualNetwork(resourceGroupName, virtualNetworkName, subnetName)
    }


    async postCreateDb(engine, dbName, status, dbCredentials, provisionVariables, instanceName) {
        await this.engine.createInitDb(resourceGroupName,serverName,dbName,this.contextClient)
        await this.createVirtualNetworkRule(instanceName, provisionVariables.resourceGroupName)
    }

    async createResourceGroup(resourceGroupName) {
        const resourceGroupsClient = new ResourceGroups(new ResourceManagementClientContext(this.azureCreds, this.credentials.subscriptionId));
        const resourceGroup = await resourceGroupsClient.createOrUpdate(resourceGroupName, { location: 'eastus' })
        return resourceGroup;
    }

    async createVirtualNetworkRule(serverName, resourceGroupName) {
        const virtualNetwork = this.VirtualNetworkService
                                   .getVirtualNetwork(resourceGroupName, virtualNetworkName)
        this.engine.createVirtualNetworkRule(serverName, resourceGroupName, virtualNetwork)
    }
}
module.exports = DbProvision