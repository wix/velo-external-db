const { NetworkManagementClient } = require("@azure/arm-network");



const createVirtualNetwork = async (creds, subscriptionId, resourceGroupName, virtualNetworkName, subnetName) => {
    return new Promise(async (resolve, reject) => {
        try {
            const networkClient = new NetworkManagementClient(creds, subscriptionId)
            const virtualNetwork = await createVirtualNetworkInstance(networkClient, resourceGroupName, virtualNetworkName)
            await virtualNetwork.pollUntilFinished();
            // await waitTillVNetAvailable(networkClient, resourceGroupName, virtualNetworkName);
            console.log("Virtual Network created successfully! ");
            const subnet = await networkClient.subnets.beginCreateOrUpdate(resourceGroupName, virtualNetworkName, subnetName, {
                'serviceEndpoints':
                    [{ "service": "Microsoft.Sql", "locations": ["eastus"] },
                    { "service": "Microsoft.KeyVault", "locations": ["eastus"] }],
                'delegations':
                    [{ 'serviceName': 'Microsoft.Web/serverFarms', 'name': 'Microsoft.Web/serverFarms' }],
                'addressPrefix': '10.0.0.0/24'
            })
            console.log("Subnet created successfully! ");
            resolve( await networkClient.virtualNetworks.get(resourceGroupName, virtualNetworkName));
        } catch (e) {
            console.log("error creating virtual network");
            reject(e)
        }
    })
}


const createVirtualNetworkInstance = async (client, resourceGroupName, virtualNetworkName) => {
    console.log("Creating Virtual Network ...");
    return await client.virtualNetworks.beginCreateOrUpdate(resourceGroupName, virtualNetworkName, { "location": "eastus", "addressSpace": { "addressPrefixes": ["10.0.0.0/16"] } });

}

const waitTillVNetAvailable = async (client, resourceGroupName, virtualNetworkName) => {
    const virtualNetworks = await client.virtualNetworks.list(resourceGroupName);
    var newVNet = virtualNetworks.find((obj) => {
        return obj.name === virtualNetworkName;
    })
    var numOfTries = 1;
    while (newVNet == undefined && numOfTries < 15) {
        await sleep(15000)
        console.log("Virtual Network deployment is in progress: ", numOfTries);
        numOfTries++;
        const virtualNetworks = await client.virtualNetworks.list(resourceGroupName);
        newVNet = virtualNetworks.find((obj) => {
            return obj.name === virtualNetworkName;
        })
    }
    return new Promise((resolve, reject) => {
        if (newVNet) {
            resolve(newVNet);
        } else {
            reject("Timeout while creating virtual network");
        }
    })
}

module.exports = { createVirtualNetwork, NetworkManagementClient }