const { RDSClient, CreateDBInstanceCommand, DescribeDBInstancesCommand } = require("@aws-sdk/client-rds");
const { AppRunnerClient, CreateServiceCommand, DescribeServiceCommand } = require("@aws-sdk/client-apprunner");
const mysql = require('mysql');
const inquirer = require('inquirer');
const consola = require('consola')


//Constants
const SLEEP_TIME = 60000;
const TIMEOUT = 600000;

//Default variables
const REGION = '';
const accessKeyId = '';
const secretAccessKey = '';
const MasterUsername = '';
const MasterUserPassword = '';
const ServiceName = '';
const imgURI = '';
const AccessRoleArn = '';
const DBInstanceIdentifier = '';
const dbName = '';
const tableNAme = '';
const secretKey = '';


const query = (host, user, password, query) => {
    return new Promise((resolve, reject) => {
        let connection = mysql.createConnection({
            host,
            user,
            password
        });
        connection.query(query, (err, rows) => {
            if (err) {
                connection.end();
                reject(err);
            }
            else {
                connection.end();
                resolve(rows);
            }
        });
    });
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const logicCredentials = () => inquirer.prompt([
    {
        type: 'input',
        message: 'AWS REGION region',
        name: 'awsRegion',
        default: REGION,
    },
    {
        type: 'input',
        message: 'AWS accessKeyId',
        name: 'awsAccessKeyId',
        default: accessKeyId,
    },
    {
        type: 'input',
        message: 'AWS secretAccessKey',
        name: 'awsSecretAccessKey',
        default: secretAccessKey,
    },
])

const getRDSInfo = () => inquirer.prompt([
    {
        type: 'input',
        message: 'Type a name for your DB instance: ',
        name: 'DBInstanceIdentifier',
        default: DBInstanceIdentifier,
    },
    {
        type: 'input',
        message: 'Type a login ID for the master user of your DB instance: ',
        name: 'MasterUsername',
        default: MasterUsername,
    },
    {
        type: 'input',
        message: 'Type a password for the master user of your DB instance: ',
        name: 'MasterUserPassword',
        default: MasterUserPassword,
    },
])

const getDBName = () => inquirer.prompt([
    {
        type: 'input',
        message: 'Type a name for your DB : ',
        name: dbName
    }
])

const getTableName = () => inquirer.prompt([
    {
        type: 'input',
        message: 'Type a name for your table : ',
        name: tableNAme
    }
])

const getAppRunnertInfo = () => inquirer.prompt([
    {
        type: 'input',
        message: 'Type a name for your AppRunner instance: ',
        name: 'appRunnerInstanceName',
        default: ServiceName
    },
    {
        type: 'input',
        message: 'Type the the desired secret key: ',
        name: secretKey
    }
])

const createRDSClient = async () => {
    const RDSClient = new RDSClient({ region: REGION, credentials: { accessKeyId, secretAccessKey } });
    return new Promise((resolve, reject) => resolve(RDSClient));
}

const CreateDBInstance = async (RDSClient, { Engine, DBInstanceClass, DBInstanceIdentifier, MasterUsername, MasterUserPassword, AllocatedStorage }) => {
    const command = new CreateDBInstanceCommand({ Engine, DBInstanceIdentifier, DBInstanceClass, MasterUsername, MasterUserPassword, AllocatedStorage });
    // return (RDSClient.send(command));
    const response = await RDSClient.send(command);
    return new Promise((resolve, reject) => {
        // check if the creation process was comleted successfuly
        if (response['$metadata']['httpStatusCode'] === 200) {
            consola.success('DB Instance was created successfully')
            resolve(response);
        } else {
            reject(response);
        }
    });
}

const waitTillDBAvailable = async (RDSClient, DBInstanceIdentifier) => {
    try {
        const command = new DescribeDBInstancesCommand({ DBInstanceIdentifier });
        var response = await RDSClient.send(command);
        var timePassed = 0;
        while (response.DBInstances[0].DBInstanceStatus != 'available' && timePassed < TIMEOUT) {
            consola.info(`DB status : ${response.DBInstances[0].DBInstanceStatus}, sleeping for ${SLEEP_TIME / 600} secs`);
            await sleep(SLEEP_TIME);
            timePassed += SLEEP_TIME;
            response = await rdsClient.send(command);
        }

        return new Promise((resolve, reject) => {
            if (response.DBInstances[0].DBInstanceStatus == 'available') {
                consola.success(`DB is ready on: ${response.DBInstances[0].Endpoint.Address}:${response.DBInstances[0].Endpoint.Port}`)
                resolve({ DBAddress: response.DBInstances[0].Endpoint.Address, DBPort: response.DBInstances[0].Endpoint.Port });
            } else {
                reject('Coudnt check DBs status within 10 mins');
            }
        });
    } catch (err) {
        console.log("Error", err);
    }
};


const CreateDB = async ({ DBEndPoint, DBName, MasterUsername, MasterUserPassword }) => {
    return query(DBEndPoint, MasterUsername, MasterUserPassword, `CREATE DATABASE ${DBName}`);
}

const CreateTable = async ({ DBEndPoint, DBName, MasterUsername, MasterUserPassword, tableName }) => {
    const queryStatement = `Create table ${DBName}.${tableName}(
        _id varchar(50) NOT NULL,
        _createdDate timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        _updatedDate timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        _owner varchar(50) DEFAULT NULL,
        name varchar(30),
        email varchar(30),
        phone varchar(15),
        PRIMARY KEY (_id)
    );`
    return query(DBEndPoint, MasterUsername, MasterUserPassword, queryStatement);
}

const createAppRunnerClient = async ({ awsRegion, awsAccessKeyId, awsSecretAccessKey }) => {
    return new Promise((resolve, reject) => {
        resolve(new AppRunnerClient({ region: awsRegion, credentials: { accessKeyId: awsAccessKeyId, secretAccessKey: awsSecretAccessKey } }));
    });
};


const createAppRunnerInstance = async (appRunnerClient, { appRunnerInstanceName, DBAddress, DBName, MasterUsername, MasterUserPassword, secretKey }) => {
    try {
        const command = new CreateServiceCommand({
            ServiceName: appRunnerInstanceName,
            AuthenticationConfiguration: {},
            SourceConfiguration: {
                ImageRepository: {
                    ImageIdentifier: imgURI,
                    ImageRepositoryType: "ECR",
                    ImageConfiguration: {
                        RuntimeEnvironmentVariables: {
                            'HOST': DBAddress,
                            'DB': DBName,
                            'USER': MasterUsername,
                            'PASSWORD': MasterUserPassword,
                            'TYPE': 'gcp/sql',
                            'SECRET_KEY	': secretKey
                        }
                    }
                },
                AuthenticationConfiguration: {
                    AccessRoleArn: AccessRoleArn
                }
            }
        });
        const response = await appRunnerClient.send(command);
        consola.success('AppRunner Instance was created successfully')
        return { ServiceArnServiceArn: response.Service.ServiceArn }
    } catch (err) {
        console.log("Error", err);
    }
};

const waitTillAppRunnerAvailable = async (appRunnerClient, ServiceArn) => {
    try {
        const command = new DescribeServiceCommand({ ServiceArn });
        var response = await appRunnerClient.send(command);
        var timePassed = 0;
        while (response.Service.Status != 'RUNNING' && timePassed < TIMEOUT) {
            consola.info(`AppRunner status : ${response.Service.Status}, sleeping for ${SLEEP_TIME / 600} secs`);
            await sleep(SLEEP_TIME);
            timePassed += SLEEP_TIME;
            response = await appRunnerClient.send(command);
        }

        return new Promise((resolve, reject) => {
            if (response.Service.Status == 'RUNNING') {
                consola.ready(`App Runner domain : https://${response.Service.ServiceUrl}`);
                resolve({ ServiceUrl: response.Service.ServiceUrl });
            } else {
                reject('Coudnt check DBs status within 10 mins');
            }
        });
    } catch (err) {
        console.log("Error", err);
    }
};


const aws_adapter_installer = async () => {
    try {
        const { awsRegion, awsAccessKeyId, awsSecretAccessKey } = await logicCredentials();
        // TODO: Create a function that checks the login credentials and the permissions

        const rdsClient = new RDSClient({ region: awsRegion, credentials: { accessKeyId: awsAccessKeyId, secretAccessKey: awsSecretAccessKey } });
        const { DBInstanceIdentifier, MasterUsername, MasterUserPassword } = await getRDSInfo();
        await CreateDBInstance(rdsClient, { Engine: 'mysql', DBInstanceIdentifier, DBInstanceClass: 'db.t2.micro', MasterUsername, MasterUserPassword, AllocatedStorage: 20 });
        const { DBAddress, DBPort } = await waitTillDBAvailable(rdsClient, DBInstanceIdentifier);

        const { DBName } = await getDBName();
        await CreateDB({ DBEndPoint: DBAddress, MasterUsername, MasterUserPassword, DBName });
        consola.success(`${DBName} db was created successfully`);
        const { tableName } = await getTableName();
        await CreateTable({ DBEndPoint: DBAddress, MasterUsername, MasterUserPassword, DBName, tableName });
        consola.success(`${tableName} table was created successfully`);

        const { appRunnerInstanceName, secretKey } = await getAppRunnertInfo();
        const appRunnerClient = new AppRunnerClient({ region: awsRegion, credentials: { accessKeyId: awsAccessKeyId, secretAccessKey: awsSecretAccessKey } });
        const { ServiceArnServiceArn } = await createAppRunnerInstance(appRunnerClient, { appRunnerInstanceName, DBAddress, DBName, MasterUsername, MasterUserPassword, secretKey })
        await waitTillAppRunnerAvailable(appRunnerClient, ServiceArnServiceArn);
    } catch (err) {
        consola.error("Error::", err);
    }
}



module.exports = { aws_adapter_installer  };
