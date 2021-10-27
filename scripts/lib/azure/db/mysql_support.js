const { MySQLManagementClient, MySQLManagementClientContext, Servers, Databases, VirtualNetworkRules } = require("@azure/arm-mysql");

const serversClient = contextClient => new Servers(contextClient)

const managementClient = (credentials, subscriptionId) => new MySQLManagementClient(credentials, subscriptionId)

const contextClient = (credentials, subscriptionId) => new MySQLManagementClientContext(credentials, subscriptionId)


const createInitDb = async (resourceGroupName, serverName, databaseName, contextClient) => {
    const dataBases = new Databases(contextClient);
    const db = await dataBases.beginCreateOrUpdate(resourceGroupName, serverName, databaseName, dataBases);
    await db.pollUntilFinished()
}

const subnetService = () => 'Microsoft.Sql'

const createVirtualNetworkRule = async (serverName, resourceGroupName, virtualNetwork) => {
    const virtualNetworkRulesClient = new VirtualNetworkRules(this.contextClient);
    const virtualNetworkRule = await virtualNetworkRulesClient.beginCreateOrUpdate(resourceGroupName, serverName, virtualNetwork.name, { "virtualNetworkSubnetId": virtualNetwork.subnets[0].id })
    await virtualNetworkRule.pollUntilFinished()
}

module.exports = {
    serversClient, managementClient, contextClient, createInitDb,subnetService, createVirtualNetworkRule
}