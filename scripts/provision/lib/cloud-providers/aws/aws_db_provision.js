const { RDSClient, CreateDBInstanceCommand, DescribeDBInstancesCommand, /*waitUntilDBInstanceAvailable*/ } = require('@aws-sdk/client-rds')
const factory = require('./db/factory')
const NetworkProvision = require('./aws_network_provision')

class DbProvision {
    constructor(credentials, region) {
        this.rdsClient = new RDSClient( { region,
                                          credentials: { accessKeyId: credentials.awsAccessKeyId,
                                                         secretAccessKey: credentials.awsSecretAccessKey } } )
        this.networkClient = new NetworkProvision(credentials, region)
    }

    async preCreateDb() { }

    async createDb( { name, engine, credentials }) {
        const response = await this.rdsClient.send(new CreateDBInstanceCommand({ Engine: engine, DBInstanceClass: 'db.t3.micro', AllocatedStorage: 20,
                                                                                       DBInstanceIdentifier: name,
                                                                                       MasterUsername: credentials.user, MasterUserPassword: credentials.passwd, ...factory.createCmdPatchFor(engine) }))
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
        const securityGroupRuleIds = await this.networkClient.addSecurityRule(status.securityGroupId, factory.portFor(engine))
        await factory.clientFor(engine)
                     .createDatabase(dbName, status.host, credentials)
        await this.networkClient.removeSecurityRule(status.securityGroupId, securityGroupRuleIds)
    }
}


module.exports = DbProvision
