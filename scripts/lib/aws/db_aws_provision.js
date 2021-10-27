const { RDSClient, CreateDBInstanceCommand, DescribeDBInstancesCommand, waitUntilDBInstanceAvailable } = require('@aws-sdk/client-rds')
const factory = require('../utils/db/factory')

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
            securityGroupId: instance.VpcSecurityGroups[0].VpcSecurityGroupId,
            available: instance.DBInstanceStatus === 'available'
        }
    }

    async postCreateDb(engine, dbName, status, credentials) {
        await factory.clientFor(engine)
                     .createDatabase(dbName, status.host, credentials)
    }
}


module.exports = DbProvision