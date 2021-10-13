const { RDSClient, CreateDBInstanceCommand, DescribeDBInstancesCommand, waitUntilDBInstanceAvailable } = require('@aws-sdk/client-rds')
const mysql = require('mysql')
const { Client } = require('pg')

class DbProvision {
    constructor(credentials, region) {
        this.rdsClient = new RDSClient( { region: region,
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

    async postCreateDb(engine, dbName, host, credentials) {
        switch (engine) {
            case 'mysql':
                await this.createDatabase(dbName, host, credentials)
                break;
            case 'postgres':
                await this.createDatabasePg(dbName, host, credentials)
                break;
        }
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

    async createDatabasePg(dbName, host, credentials) {
        console.log(host, credentials, dbName)
        const client = new Client({
            host,
            user: credentials.user,
            password: credentials.password,
            database: 'postgres',
            port: 5432,
        })
        console.log('before')
        await client.connect()
        console.log('after')
        const res = await client.query(`CREATE DATABASE ${dbName}`)
        console.log('after create')
        console.log(res)
        await client.end()
    }
}


module.exports = DbProvision