const { MySQLManagementClient, MySQLManagementClientContext, Servers, Databases, FirewallRules, VirtualNetworkRules } = require("@azure/arm-mysql");

const serversClient = contextClient => new Servers(contextClient)

const managementClient = (credentials, subscriptionId) => new MySQLManagementClient(credentials, subscriptionId)

const contextClient = (credentials, subscriptionId) => new MySQLManagementClientContext(credentials, subscriptionId)

const createVirtualNetworkRule = async (client, serverName, virtualNetwork, dbCredentials) => {
    const virtualNetworkRulesClient = new VirtualNetworkRules(client);
    const virtualNetworkRule = await virtualNetworkRulesClient.beginCreateOrUpdate(dbCredentials.resourceGroupName, serverName, virtualNetwork.name, { "virtualNetworkSubnetId": virtualNetwork.subnets[0].id })
    await virtualNetworkRule.pollUntilFinished()
    return virtualNetworkRule;
}

const createFirewallRule = async (client, serverName, resourceGroupName, from, to) => {
    const fireWallRule = new FirewallRules(client);
    const res = await fireWallRule.beginCreateOrUpdate(resourceGroupName, serverName, "newRule", { startIpAddress: from, endIpAddress: to });
    res.pollUntilFinished()
    return res;
}

const deleteRule = async (client, dbCredentials, serverName, ruleName) => {
    const fireWallRule = new FirewallRules(client);
    await fireWallRule.deleteMethod(dbCredentials.resourceGroupName, serverName, ruleName)
    return;
}

const createDb = async (dbCredentials, serverName, dbName, client) => {
    const dataBases = new Databases(client);
    const DB = await dataBases.beginCreateOrUpdate(dbCredentials.resourceGroupName, serverName, dbName, dataBases);
    await DB.pollUntilFinished()
    return;
}

const dbStatus = (client, dbCredentials, name) => {
    const servers = new Servers(client)
    return await servers.get(dbCredentials.resourceGroupName, name)
}

const createInitDb = async (resourceGroupName, serverName, databaseName, contextClient) => {
    await createFirewallRule(contextClient, serverName, resourceGroupName, '0.0.0.0', '255.255.255.255')
    // const connection = await connectMySqlServer(serverName, dbCredentials, databaseName)

    const dataBases = new Databases(contextClient);
    const db = await dataBases.beginCreateOrUpdate(resourceGroupName, serverName, databaseName, dataBases);
    await db.pollUntilFinished()
    
    
    
}

const connectMySqlServer = async (serverName, dbCredentials, database) => {
    const connection = new mysql.createConnection({
        host: `${dbCredentials.serverName}.mysql.database.azure.com`,
        user: `${dbCredentials.userName}@${serverName}`,
        password,
        database,
        ssl: true
    })
    return connection
}

module.exports = {
    serversClient, managementClient, contextClient, createVirtualNetworkRule, createFirewallRule, deleteRule,
    createDb, dbStatus, createInitDb
}