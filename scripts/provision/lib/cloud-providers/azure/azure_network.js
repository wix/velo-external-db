const { NetworkManagementClient } = require('@azure/arm-network')
const { DefaultAzureCredential } = require('@azure/identity')

class VirtualNetwork {
    constructor(credentials, engineClient, region) {
        this.networkClient = new NetworkManagementClient(new DefaultAzureCredential(), credentials.subscriptionId)
        this.engineClient = engineClient
        this.region = region
    }

    async createVirtualNetwork(resourceGroupName, virtualNetworkName, subnetName) {
        await this.createVirtualNetworkInstance(resourceGroupName, virtualNetworkName)
        await this.createSubnet(resourceGroupName, virtualNetworkName, subnetName)
    }

    async createVirtualNetworkInstance(resourceGroupName, virtualNetworkName) {
        const virtualNetwork = await this.networkClient.virtualNetworks
                                                       .beginCreateOrUpdate(resourceGroupName, virtualNetworkName,
                                                                            {
                                                                                location: this.region,
                                                                                addressSpace: { addressPrefixes: ['10.0.0.0/16'] }
                                                                            } )
        await virtualNetwork.pollUntilFinished()
    }

    async createSubnet(resourceGroupName, virtualNetworkName, subnetName) {
        await this.networkClient.subnets
                                .beginCreateOrUpdate(resourceGroupName, virtualNetworkName, subnetName,
                                                     {
                                                         serviceEndpoints: [ {
                                                                                 service: this.engineClient.subnetService(),
                                                                                 locations: [this.region]
                                                                             }, {
                                                                                 service: 'Microsoft.KeyVault', locations: [this.region]
                                                                           } ],
                                                         delegations: [{
                                                             serviceName: 'Microsoft.Web/serverFarms',
                                                             name: 'Microsoft.Web/serverFarms'
                                                         } ],
                                                         addressPrefix: '10.0.0.0/24'
                                                     } )
    }

    async getVirtualNetwork(resourceGroupName, virtualNetworkName) {
        return await this.networkClient.virtualNetworks
                                       .get(resourceGroupName, virtualNetworkName)
    }
}



module.exports = VirtualNetwork