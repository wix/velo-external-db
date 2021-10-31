const { NetworkManagementClient } = require('@azure/arm-network');
const { DefaultAzureCredential } = require('@azure/identity')

class VirtualNetwork {
    constructor(credentials, engine) {
        this.networkClient = new NetworkManagementClient(new DefaultAzureCredential(), credentials.subscriptionId)
        this.engine = engine
    }

    async createVirtualNetwork(resourceGroupName, virtualNetworkName, subnetName) {
        await this.createVirtualNetworkInstance(resourceGroupName, virtualNetworkName)
        console.log("createVirtualNetworkInstance");
        await this.createSubnet(resourceGroupName, virtualNetworkName, subnetName)
        console.log("createSubnet");
    }

    async createVirtualNetworkInstance(resourceGroupName, virtualNetworkName) {
        const virtualNetwork = await this.networkClient
                                         .virtualNetworks
                                         .beginCreateOrUpdate(resourceGroupName, virtualNetworkName,
                                            {
                                                location: 'eastus',
                                                addressSpace: { addressPrefixes: ['10.0.0.0/16'] }
                                            }
                                        )
        await virtualNetwork.pollUntilFinished();
    }

    async createSubnet(resourceGroupName, virtualNetworkName, subnetName) {
        const subnet = await this.networkClient
                                 .subnets
                                 .beginCreateOrUpdate(resourceGroupName, virtualNetworkName, subnetName, 
                                                        {
                                                            serviceEndpoints:
                                                                [{
                                                                    service: this.engine.subnetService(),
                                                                    locations: ['eastus']
                                                                },
                                                                { service: 'Microsoft.KeyVault', locations: ['eastus'] }],
                                                            delegations:
                                                                [{
                                                                    serviceName: 'Microsoft.Web/serverFarms',
                                                                    name: 'Microsoft.Web/serverFarms'
                                                                }],
                                                            addressPrefix: '10.0.0.0/24'
                                                        }
                                                     )
    }

    async getVirtualNetwork(resourceGroupName, virtualNetworkName) {
        return await this.networkClient.virtualNetworks.get(resourceGroupName, virtualNetworkName)
    }
}



module.exports = VirtualNetwork