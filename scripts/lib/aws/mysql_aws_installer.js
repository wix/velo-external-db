const { RDSClient, CreateDBInstanceCommand, DescribeDBInstancesCommand} = require('@aws-sdk/client-rds')

class AwsDbProvision {
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
        const response = await this.rdsClient.send(new DescribeDBInstancesCommand({ DBInstanceIdentifier: name }))

        const instance = response.DBInstances[0]
        return {
            host: instance.Endpoint.Address,
            port: instance.Endpoint.Port,
            available: instance.DBInstanceStatus === 'available'
        }
    }

    async createConfig() {
        console.log('createConfig')
    }

    async postCreateDb() {
        console.log('postCreate')
    }
}




/*
    await provider.createDb(credentials)
    await provider.waitTillDBAvailable()
    await provider.postCreateDb()

 */


module.exports = AwsDbProvision