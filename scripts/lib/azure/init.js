const { DefaultAzureCredential } = require("@azure/identity");
const msRestNodeAuth = require('@azure/ms-rest-nodeauth')
const { GraphRbacManagementClient, GraphRbacManagementModels, GraphRbacManagementMappers } = require("@azure/graph")
const { v4: uuid } = require('uuid')
const inquirer = require('inquirer');
const Spinner = require('cli-spinner').Spinner;
const { green, grey, greenBright, redBright } = require('chalk');





if (process.env.NODE_ENV) {
    console.log('dotenv');
    const dotenv = require('dotenv');
    dotenv.config({ path: './env-file' });
}

const init = async () => {
    const randomPart = uuid().substring(0, 8)
    const randomStr =  Math.random().toString(36).slice(2)
    return {
        resourceGroupName: `velo-external-db-resource-group-${randomPart}`, 
        mySqlServerName: `mysql-${randomPart}`,
        dbName: 'guest', 
        webAppName: `webapp-${randomPart}`, 
        virtualNetworkName: `virtual-network-${randomPart}`, 
        subnetName: `subnet-${randomPart}`, 
        keyVaultName: `keyvault-${randomPart}`, 
        serverFarmId: process.env.SERVER_FARM_ID, //try to figure out how to get it
        type: 'sql', 
        cloudVendor: 'azr',
        secretKey: randomStr, 
        userObjectId: process.env.USER_OBJECT_ID, //need to figure out how to get it on runtime. 
        dockerImage:'DOCKER|veloex/velo-external-db:1.0'
    }
}

const keyVaultVariables = (env,userName,password) => {
    return {
        DB: env.dbName,
        HOST: `${env.mySqlServerName}.mysql.database.azure.com`,
        PASSWORD: password,
        TYPE: env.type,
        CLOUDVENDOR: env.cloudVendor,
        SECRETKEY: env.secretKey,
        USER: `${userName}@${env.mySqlServerName}`,
    }
}

const appServiceVariables = (keyVaultName) => {
    return {
        DB: refFromKeyVault(keyVaultName, 'DB'),
        HOST: refFromKeyVault(keyVaultName, 'HOST'),
        PASSWORD: refFromKeyVault(keyVaultName, 'PASSWORD'),
        TYPE: refFromKeyVault(keyVaultName, 'TYPE'),
        CLOUD_VENDOR: refFromKeyVault(keyVaultName, 'CLOUDVENDOR'),
        SECRET_KEY: refFromKeyVault(keyVaultName, 'SECRETKEY'),
        USER: refFromKeyVault(keyVaultName, 'USER'),
        PORT: refFromKeyVault(keyVaultName, 'PORT'),
    }
}

const refFromKeyVault = (keyVaultName, secretName) => {
    return `@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=${secretName})`
}

const startSpinnerWith = async (msg, f, completeMsg) => {
    const spinner = new Spinner({
        text: `%s ${msg}`,
        stream: process.stderr,
        onTick: function(msg){
            this.clearLine(this.stream);
            this.stream.write(msg);
        }
    })
  
    spinner.setSpinnerString(18)
  
    spinner.start()
  
    try {
        const res = await f()
  
        spinner.stop(true)
  
        process.stderr.write(`${greenBright('✓')} ${grey(completeMsg || msg)}\n`)
  
        return res
    } catch (e) {
        spinner.stop(true)
        process.stderr.write(`${redBright('✓')} ${grey(completeMsg || msg)}\n`)
        process.stderr.write(redBright('Process failed\n'))
        process.exit(1)
    }
  
  }
  

module.exports = { init, keyVaultVariables, appServiceVariables, startSpinnerWith }