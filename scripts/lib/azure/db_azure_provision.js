const { ResourceManagementClientContext, ResourceGroups } = require("@azure/arm-resources");
const { NetworkManagementClient } = require("@azure/arm-network");


class DbProvision {
    constructor(credentials, subscriptionId, engine) {
        this.engine = engine
        this.managementClient = new engine.managementClient(credentials, subscriptionId)
        this.contextClient = new engine.contextClient(credentials, subscriptionId)
    }


    async createDb({ name, dbCredentials }) {
        try {
            const servers = new this.engine.serversClient(this.contextClient)
            const response = await servers.beginCreate(dbCredentials.resourceGroupName, dbCredentials.serverName, {
                properties:
                {
                    createMode: "Default", administratorLogin: dbCredentials.administratorLogin,
                    administratorLoginPassword: dbCredentials.administratorLoginPassword, sslEnforcement: 'Disabled'
                },
                location: "eastus", sku: { tier: "GeneralPurpose", name: "GP_Gen5_4" }
            })
            await response.pollUntilFinished()
            return true;
        }
        catch (e) {
            console.log(e);
            return false
        }
    }

    async dbStatusAvailable(dbCredentials, name) {
        const instance = await this.engine.dbStatus(this.contextClient, dbCredentials, name)

        return {
            host: instance.fullyQualifiedDomainName,
            available: instance.userVisibleState === 'Ready'
        }
    }

    async addSecurityRule(serverName, dbCredentials, virtualNetwork, from, to) {
        if (virtualNetwork)
            await this.engine.createVirtualNetworkRule(this.contextClient, serverName, virtualNetwork, dbCredentials)
        else
            await this.engine.createFirewallRule(this.contextClient, serverName, dbCredentials, from, to)
        return;
    }


    async preCreateDb(credentials, subscriptionId, resourceGroupName) {
        //create resourceGroup, virtualNetwork
        const resourceGroup = await createResourceGroup(credentials, subscriptionId, resourceGroupName)
        const virtualNetwork = await createVirtualNetwork(credentials, subscriptionId, resourceGroupName, virtualNetworkName, subnetName)
    }


    async postCreateDb(engine, serverName, dbName, dbCredentials) {
        //create DB, table?
        await this.engine.createDb(dbCredentials, serverName, dbName, this.contextClient)
    }

    async createResourceGroup(credentials, subscriptionId, resourceGroupName) {
        const resourceGroupsClient = new ResourceGroups(new ResourceManagementClientContext(credentials, subscriptionId));
        const resourceGroup = await resourceGroupsClient.createOrUpdate(resourceGroupName, { "location": "eastus" })
        return resourceGroup;
    }

    async createVirtualNetwork(credentials, subscriptionId, resourceGroupName, virtualNetworkName, subnetName) {
        const networkClient = new NetworkManagementClient(credentials, subscriptionId)
        await createVirtualNetworkInstance(networkClient, resourceGroupName, virtualNetworkName)
        await createSubnet(networkClient, resourceGroupName, virtualNetworkName, subnetName)
        return await networkClient.virtualNetworks.get(resourceGroupName, virtualNetworkName)
    }

    async createVirtualNetworkInstance(networkClient, resourceGroupName, virtualNetworkName) {
        const virtualNetwork = await networkClient.virtualNetworks.beginCreateOrUpdate(resourceGroupName, virtualNetworkName, { "location": "eastus", "addressSpace": { "addressPrefixes": ["10.0.0.0/16"] } });
        await virtualNetwork.pollUntilFinished();
        return virtualNetwork
    }

    async createSubnet(networkClient, resourceGroupName, virtualNetworkName, subnetName) {
        const subnet = await networkClient.subnets.beginCreateOrUpdate(resourceGroupName, virtualNetworkName, subnetName, {
            'serviceEndpoints':
                [{ "service": "Microsoft.Sql", "locations": ["eastus"] },
                { "service": "Microsoft.KeyVault", "locations": ["eastus"] }],
            'delegations':
                [{ 'serviceName': 'Microsoft.Web/serverFarms', 'name': 'Microsoft.Web/serverFarms' }],
            'addressPrefix': '10.0.0.0/24'
        })
        await subnet.pollUntilFinished();
        return subnet
    }
}
module.exports = DbProvision