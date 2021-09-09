const { init, keyVaultVariables, appServiceVariables, startSpinnerWith } = require('./init');
const { createVirtualNetwork } = require('./VirtualNetwork')
const { createMySQL } = require('./MySql');
const { createAppService, loadEnviormentVariables } = require('./AppService');
const { createKeyVault } = require('./KeyVault')
const { DefaultAzureCredential } = require("@azure/identity");
const { createResourceGroup } = require('./ResourceGroup')
const inquirer = require('inquirer');


const main = async () => {
  try {
    const subscriptionId = process.env["AZURE_SUBSCRIPTION_ID"];
    const creds = new DefaultAzureCredential();
    const env = await init()
    const { userName, password } = await dbLogicCredentials()

    await startSpinnerWith('Creating resource group', () => createResourceGroup(creds, subscriptionId, env.resourceGroupName), 'Resource group created')

    const virtualNetwork = await startSpinnerWith("Creating virtual network", () => createVirtualNetwork(creds, subscriptionId, env.resourceGroupName, env.virtualNetworkName, env.subnetName)
      , "virtualNetwork created  ")

    await startSpinnerWith("Creating MySQL enviorment", () => createMySQL(creds, subscriptionId, env.resourceGroupName, env.mySqlServerName, userName, password, env.dbName, virtualNetwork),
      "MySQL enviorment created ")

    const { webAppResponse, webAppClient } = await startSpinnerWith("Creating AppService", () => createAppService(creds, subscriptionId, env.resourceGroupName, env.serverFarmId, env.webAppName, virtualNetwork, env.dockerImage),
      "AppService created ")

    await startSpinnerWith("Creating KeyVault and Loading secrets", () => createKeyVault(creds, subscriptionId, env.resourceGroupName, env.keyVaultName, webAppResponse.identity, keyVaultVariables(env, userName, password), `${virtualNetwork.id}/subnets/${env.subnetName}`, env.userObjectId),
      "KeyVault created and loaded")

    await startSpinnerWith("Loading config into webapp", () => loadEnviormentVariables(webAppClient, env.resourceGroupName, env.webAppName,env.keyVaultName), "Config loaded")

    console.log('done! ');
    console.log('adapter URL: ', webAppResponse.defaultHostName);
    return;
  }
  catch (error) {
    console.log("Error: ", error);
    return;
  }
}

const dbLogicCredentials = () => inquirer.prompt([
  {
    type: 'input',
    message: 'DB User',
    name: 'userName',
    default: 'demo_admin',
  },
  {
    type: 'password',
    message: 'DB Password',
    name: 'password',
    default: 'veloPassword1',
  },
])

main();
