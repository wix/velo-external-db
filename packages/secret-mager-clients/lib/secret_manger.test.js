
const mockClient = require('aws-sdk-client-mock');
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const { SecretMangerClientAWS } = require('./secret_mager_aws')

const snsMock = mockClient.mockClient(SecretsManagerClient);


describe('Secrect Manger Clients', () => {
    
    describe('AWS - Secrect Manger Client', () => {

        test('get secerts', async () => {
            const SecretString  = { 
                host : 'host',
                port : 'port',
                username : 'userName',
                password : 'password',
                DB : 'DB',
                SECRET_KEY : 'SECRET_KEY',
            };
            snsMock.on(GetSecretValueCommand).resolves({ SecretString : JSON.stringify(SecretString) });
            const result = await env.aws_secretMangerClient.getSecrets();
            expect(result).toStrictEqual(SecretString);
        })

    })

    const env = {
    };

    beforeEach(() => {
        snsMock.reset();
      });

    beforeAll(function() {
        env.aws_secretMangerClient = new SecretMangerClientAWS();
    });

})

