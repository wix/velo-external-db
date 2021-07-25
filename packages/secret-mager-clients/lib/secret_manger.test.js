const mockClient = require('aws-sdk-client-mock');
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const { SecretMangerClientENV, SecretMangerClientAWS } = require('./secret_mager_aws')

const SecretsManagerMock = mockClient.mockClient(SecretsManagerClient);


describe('Secrect Manger Clients', () => {

    describe('ENV - Secrect Manger Client', () => {
        
        const SecretString  = { 
            HOST : 'host',
            USERNAME : 'userName',
            PASSWORD : 'password',
            DB : 'DB',
            SECRET_KEY : 'SECRET_KEY',
        };

        beforeEach(() => {
            jest.resetModules();
            process.env = { ...process.env, ...SecretString };
        });
    
    
        test('get secerts', async () => {
            const result = await env.env_secretMangerClient.getSecrets();
            expect(result).toStrictEqual(SecretString);
        });

        test('get secerts with not all the required fields', async () => {
            delete process.env.HOST;
            await expect(env.env_secretMangerClient.getSecrets()).rejects.toEqual('Missing required props: HOST');
        });

    });
    
    describe('AWS - Secrect Manger Client', () => {
        
        const SecretString  = { 
            host : 'host',
            port : 'port',
            username : 'userName',
            password : 'password',
            DB : 'DB',
            SECRET_KEY : 'SECRET_KEY',
        };

        beforeEach(() => {
            jest.resetModules();
            SecretsManagerMock.reset();
        });

        test('get secerts', async () => {
            SecretsManagerMock.on(GetSecretValueCommand).resolves({ SecretString : JSON.stringify(SecretString) });
            const result = await env.aws_secretMangerClient.getSecrets();
            expect(result).toStrictEqual(SecretString);
        });

        test('get secerts with not all the required fields', async () => {
            const brokenSecretThings = SecretString;
            delete brokenSecretThings.host;
            SecretsManagerMock.on(GetSecretValueCommand).resolves({ SecretString : JSON.stringify(brokenSecretThings) });
            await expect(env.aws_secretMangerClient.getSecrets()).rejects.toEqual('Missing required props: host');
        });

    });

    const env = {
    };


    beforeAll(function() {
        env.aws_secretMangerClient = new SecretMangerClientAWS();
        env.env_secretMangerClient = new SecretMangerClientENV();
    });

})

