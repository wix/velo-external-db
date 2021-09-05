const { MySQLManagementClient, MySQLManagementClientContext, Servers, Databases, FirewallRules, VirtualNetworkRules } = require("@azure/arm-mysql");
const mysql = require('mysql');
const inquirer = require('inquirer');
const { startSpinnerWith } = require('./init')




const createMySQL = async (creds, subscriptionId, resourceGroupName, serverName, userName, password, database, virtualNetwork) => {
    return new Promise(async (resolve, reject) => {
        try {
            const mySqlClient = new MySQLManagementClient(creds, subscriptionId);
            const contextClient = new MySQLManagementClientContext(creds, subscriptionId);
            const servers = new Servers(contextClient);

            const instance = await startSpinnerWith("\tCreating MySQL server instance", () => createMySqlInstance(resourceGroupName, serverName, userName, password, servers),
                "\tMySQL server instance created ")
 
            await openMySqlForAll(mySqlClient, resourceGroupName, serverName);

            await startSpinnerWith("\tApplying FireWall rule", () => applyFireWallRule(contextClient, resourceGroupName, serverName, virtualNetwork),
                "\tFireWall rule applied ")

            await startSpinnerWith("\tCreating database", () => createDB(resourceGroupName, serverName, "guest", contextClient), "new DB created !")

            const connection = await startSpinnerWith("\tConnecting to MySQL", () => connectMySqlServer(serverName, userName, password, database),
                "\tConnected to MySQL server ")

            await startSpinnerWith("\tCreating table", () => createTable(connection),
                "\tTable created")
            await cancelOpenForAllRule(mySqlClient, resourceGroupName, serverName)

            await startSpinnerWith("\tDisconnecting from MySQL server", () => connection.end(), "\tDisconnected from MySQL server")

            resolve({ instance, userName, password });
        } catch (err) {
            console.log(err);
            reject(err)
        }
    })
}
const cancelOpenForAllRule = async (mySqlClient, resourceGroupName, serverName) => {
    try {
        const fireWallRule = new FirewallRules(mySqlClient);
        await fireWallRule.deleteMethod(resourceGroupName, serverName, "allowAll").catch(e => { console.log("i don't care"); })
        return;
    } catch (e) {
        console.log('error cancel open for all func', e.message);
        return;
    }
}



const applyFireWallRule = async (mySqlClient, resourceGroupName, serverName, virtualNetwork) => {
    const rule = await createVirtualNetworkRule(mySqlClient, resourceGroupName, serverName, virtualNetwork);
    return rule;
}

const createVirtualNetworkRule = async (mySqlClient, resourceGroupName, serverName, virtualNetwork) => {
    return new Promise(async (resolve, reject) => {
        try {
            const virtualNetworkRulesClient = new VirtualNetworkRules(mySqlClient);
            const virtualNetworkRule = await virtualNetworkRulesClient.beginCreateOrUpdate(resourceGroupName, serverName, virtualNetwork.name, { "virtualNetworkSubnetId": virtualNetwork.subnets[0].id })
            await virtualNetworkRule.pollUntilFinished()
            resolve(virtualNetworkRule);
        } catch (err) {
            reject(err);
        }
    })
}

const connectMySqlServer = (serverName, userName, password, database) => {
    return new Promise((resolve, reject) => {
        try {
            const connection = new mysql.createConnection({
                host: `${serverName}.mysql.database.azure.com`,
                user: `${userName}@${serverName}`,
                password,
                database,
                ssl: true
            })
            resolve(connection);
        } catch (err) {
            reject("connection failed", err);
        }
    });
}
const openMySqlForAll = async (mySqlClient, resourceGroupName, serverName) => {
    return new Promise(async (resolve, reject) => {
        try {
            const fireWallRule = new FirewallRules(mySqlClient);
            const res = await fireWallRule.beginCreateOrUpdate(resourceGroupName, serverName, "allowAll", { startIpAddress: "0.0.0.0", endIpAddress: "255.255.255.255" });
            res.pollUntilFinished()
            resolve(res);
        } catch (err) {
            reject("firewall rule creation failed: ", err);
        }
    })
}
const createDB = async (resourceGroupName, serverName, databaseName, contextClient) => {
    return new Promise(async (resolve, reject) => {
        try {
            const dataBases = new Databases(contextClient);
            const DB = await dataBases.beginCreateOrUpdate(resourceGroupName, serverName, databaseName, dataBases);
            await DB.pollUntilFinished()
            resolve(DB);
        }
        catch (err) {
            reject("DB creation failed: ", err)
        }
    })
}

const createMySqlInstance = async (resourceGroupName, serverName, administratorLogin, administratorLoginPassword, servers) => {
    return new Promise(async (resolve, reject) => {
        try {
            const instance = await servers.beginCreate(resourceGroupName, serverName, { properties: { createMode: "Default", administratorLogin, administratorLoginPassword, sslEnforcement: 'Disabled' }, location: "eastus", sku: { tier: "GeneralPurpose", name: "GP_Gen5_4" } })
            await instance.pollUntilFinished()
            resolve(instance)
        } catch (e) {
            reject(e)
        }
    })


}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
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

//getListOfServers(client,resourceGroupName);
//getServer("velo-external-db-mysql3")
const getServer = async (serverName, servers) => {
    mySqlClient.servers.get(resourceGroupName, serverName).then((result) => {
        console.log("The result is:");
        console.log(result);
    }).catch((err) => {
        console.log("An error occurred:");
        console.error(err);
    });
}
const showAppServicesList = async () => {
    try {
        listOfServices = await appServiceClient.appServiceCertificateOrders.list();
        console.log(listOfServices);
    } catch (err) {
        console.log("An error occurred: ", err);
    }
}

const createTable = (connection) => {

    const queryStatement = `Create table persons(
      _id varchar(50) NOT NULL,
      _createdDate timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      _updatedDate timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      _owner varchar(50) DEFAULT NULL,
      name varchar(30),
      email varchar(30),
      phone varchar(15),
      PRIMARY KEY (_id)
    );`
    return query(connection, queryStatement);
}

const query = async (connection, query) => {
    return new Promise(async (resolve, reject) => {
        connection.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
}

module.exports = { createMySQL, applyFireWallRule }