const { DefaultAzureCredential } = require("@azure/identity");
const msRestNodeAuth = require('@azure/ms-rest-nodeauth')
const { GraphRbacManagementClient, GraphRbacManagementModels, GraphRbacManagementMappers } = require("@azure/graph")




if (process.env.NODE_ENV) {
    console.log('dotenv');
    const dotenv = require('dotenv');
    dotenv.config({ path: './env-file' });
}

const init = () => {
    return {
        resourceGroupName: process.env.RESOURCE_GROUP_NAME,
        mySqlServerName: process.env.MY_SQL_SERVER_NAME,
        userName: process.env.USERNAME,
        password: process.env.PASSWORD,
        dbName: process.env.DB_NAME,
        webAppName: process.env.WEB_APP_NAME,
        virtualNetworkName: process.env.VIRTUAL_NETWORK_NAME,
        subnetName: process.env.SUBNET_NAME,
        keyVaultName: process.env.KEY_VAULT_NAME,
        serverFarmId: process.env.SERVER_FARM_ID,
        type: process.env.TYPE,
        cloudVendor: process.env.CLOUD_VENDOR,
        secretKey: process.env.SECRET_KEY,
        userObjectId: process.env.USER_OBJECT_ID //need to figure out how to get it on runtime. 
    }
}

const keyVaultVariables = (env) => {
    return {
        DB: env.dbName,
        HOST: `${env.mySqlServerName}.mysql.database.azure.com`,
        PASSWORD: env.password,
        TYPE: env.type,
        CLOUDVENDOR: env.cloudVendor,
        SECRETKEY: env.secretKey,
        USER: `${env.userName}@${env.mySqlServerName}`,
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



module.exports = { init, keyVaultVariables, appServiceVariables }