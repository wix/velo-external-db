const { RDSClient, CreateDBInstanceCommand, DescribeDBInstancesCommand, waitUntilDBInstanceAvailable } = require('@aws-sdk/client-rds')
const mysql = require('mysql')

class DbProvision {
    constructor(credentials) {
        this.rdsClient = new RDSClient( { region: 'us-east-2',
                                          credentials: { accessKeyId: credentials.awsAccessKeyId,
                                                         secretAccessKey: credentials.awsSecretAccessKey } } )
    }

    async createDb( { name, engine, credentials }) {
        const response = await this.rdsClient.send(new CreateDBInstanceCommand({ Engine: engine, DBInstanceClass: 'db.t3.micro', AllocatedStorage: 20,
                                                                                       DBInstanceIdentifier: name,
                                                                                       MasterUsername: credentials.user, MasterUserPassword: credentials.passwd }))
        return response['$metadata']['httpStatusCode'] === 200
    }

    async dbStatusAvailable(name) {
        // todo: use waitUntilDBInstanceAvailable
        const response = await this.rdsClient.send(new DescribeDBInstancesCommand({ DBInstanceIdentifier: name }))

        const instance = response.DBInstances[0]
        return {
            host: instance.Endpoint.Address,
            port: instance.Endpoint.Port,
            available: instance.DBInstanceStatus === 'available'
        }
    }

    async postCreateDb(dbName, host, credentials) {
        await this.createDatabase(dbName, host, credentials)
    }

    async createDatabase(dbName, host, credentials) {
        let connection

        try {
            connection = mysql.createConnection({
                host: host,
                user: credentials.user,
                password: credentials.passwd,
            })
            connection.connect()
            connection.query(`CREATE DATABASE ${dbName}`)
        } catch (err) {
            console.error(err)
        } finally {
            if (connection) {
                connection.end()
            }
        }
    }
}


module.exports = DbProvision