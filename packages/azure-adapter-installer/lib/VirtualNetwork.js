const { NetworkManagementClient } = require("@azure/arm-network");
const { startSpinnerWith } = require('./init')


const createVirtualNetwork = async (creds, subscriptionId, resourceGroupName, virtualNetworkName, subnetName) => {
    return new Promise(async (resolve, reject) => {
        try {
            const networkClient = new NetworkManagementClient(creds, subscriptionId)
            await startSpinnerWith("\tCreating virtual network instance", () => createVirtualNetworkInstance(networkClient, resourceGroupName, virtualNetworkName), "\t Virtual Network created successfully!")
            await startSpinnerWith("\tCreating subnet", () => createSubnet(networkClient, resourceGroupName, virtualNetworkName, subnetName), "\t Subnet created successfully!")

            resolve(await networkClient.virtualNetworks.get(resourceGroupName, virtualNetworkName));
        } catch (e) {
            console.log("error creating virtual network");
            reject(e)
        }
    })
}


const createVirtualNetworkInstance = async (client, resourceGroupName, virtualNetworkName) => {
    return new Promise(async (resolve, reject) => {
        try {
            const virtualNetwork = await client.virtualNetworks.beginCreateOrUpdate(resourceGroupName, virtualNetworkName, { "location": "eastus", "addressSpace": { "addressPrefixes": ["10.0.0.0/16"] } });
            await virtualNetwork.pollUntilFinished();
            resolve(virtualNetwork)
        } catch (e) {
            console.log(e);
            reject(e)
        }
    })

}
const createSubnet = async (client, resourceGroupName, virtualNetworkName, subnetName) => {
    return new Promise(async (resolve, reject) => {
        try {
            const subnet = await client.subnets.beginCreateOrUpdate(resourceGroupName, virtualNetworkName, subnetName, {
                'serviceEndpoints':
                    [{ "service": "Microsoft.Sql", "locations": ["eastus"] },
                    { "service": "Microsoft.KeyVault", "locations": ["eastus"] }],
                'delegations':
                    [{ 'serviceName': 'Microsoft.Web/serverFarms', 'name': 'Microsoft.Web/serverFarms' }],
                'addressPrefix': '10.0.0.0/24'
            })
            await subnet.pollUntilFinished();
            resolve(subnet)
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = { createVirtualNetwork, NetworkManagementClient }