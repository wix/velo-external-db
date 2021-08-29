const { init, keyVaultVariables, appServiceVariables } = require('./init');
const { createVirtualNetwork } = require('./VirtualNetwork')
const { createMySQL } = require('./MySql');
const { createAppService } = require('./AppService');
const { createKeyVault } = require('./KeyVault')
const { DefaultAzureCredential } = require("@azure/identity");
const { createResourceGroup } = require ('./ResourceGroup')

const main = async () => {
  try {
    const env = init()
    const subscriptionId = process.env["AZURE_SUBSCRIPTION_ID"];
    const creds = new DefaultAzureCredential();
    await createResourceGroup (creds, subscriptionId, env.resourceGroupName)
    console.log("Resource group created successfully ! ");

    const virtualNetwork = await createVirtualNetwork(creds, subscriptionId, env.resourceGroupName, env.virtualNetworkName, env.subnetName)
    console.log("virtualNetwork created successfully ! ");

    await createMySQL(creds, subscriptionId, env.resourceGroupName, env.mySqlServerName, env.userName, env.password, env.dbName, virtualNetwork);
    console.log("MySQL server, db and table created successfully ! ");

    const { webAppResponse, webAppClient } = await createAppService(creds, subscriptionId, env.resourceGroupName, env.serverFarmId, env.webAppName, virtualNetwork);


    await createKeyVault(creds, subscriptionId, env.resourceGroupName, env.keyVaultName, webAppResponse.identity, keyVaultVariables(env), `${virtualNetwork.id}/subnets/${env.subnetName}`,env.userObjectId)

    console.log('loading enviorment variables to webApp');
    await webAppClient.updateApplicationSettings(env.resourceGroupName, env.webAppName, {
      properties: appServiceVariables(env.keyVaultName)
    })
    console.log('done! ');
    console.log('adapter URL: ' ,webAppResponse.defaultHostName);
    return;
  }
  catch (error) {
    console.log("Error: ", error);
    return;
  }
}

main();
