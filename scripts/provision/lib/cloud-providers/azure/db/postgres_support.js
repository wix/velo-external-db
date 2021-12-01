const { PostgreSQLManagementClient, PostgreSQLManagementClientContext, Servers, Databases, VirtualNetworkRules } = require('@azure/arm-postgresql')

const serversClient = contextClient => new Servers(contextClient)

const managementClient = (credentials, subscriptionId) => new PostgreSQLManagementClient(credentials, subscriptionId)

const contextClient = (credentials, subscriptionId) => new PostgreSQLManagementClientContext(credentials, subscriptionId)


const createInitDb = async(resourceGroupName, serverName, databaseName, contextClient) => {
    const dataBases = new Databases(contextClient)
    await dataBases.beginCreateOrUpdate(resourceGroupName, serverName, databaseName, {})  
}

const subnetService = () => 'Microsoft.Sql'

const createVirtualNetworkRule = async(serverName, resourceGroupName, virtualNetwork, contextClient) => {
    const virtualNetworkRulesClient = new VirtualNetworkRules(contextClient)
    await virtualNetworkRulesClient.beginCreateOrUpdate(resourceGroupName, serverName, virtualNetwork.name, { virtualNetworkSubnetId: virtualNetwork.subnets[0].id })
}

module.exports = {
    serversClient, managementClient, contextClient, createInitDb, subnetService, createVirtualNetworkRule
}