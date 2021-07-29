const mockClient = require('aws-sdk-client-mock');
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const { SecretMangerClientENV, SecretMangerClientAWS } = require('./secretMagerClients')

const SecretsManagerMock = mockClient.mockClient(SecretsManagerClient);


describe('Secrect Manger Clients', () => {
    
    const ENVs  = { 
        HOST : 'host',
        USERNAME : 'userName',
        PASSWORD : 'password',
        DB : 'DB',
        SECRET_KEY : 'SECRET_KEY',
    };
    const SecretString  = { 
        host : 'host',
        username : 'userName',
        password : 'password',
        db : 'DB',
        secretKey : 'SECRET_KEY',
    };

    describe('ENV/AZR/GCP - Secrect Manger Client', () => {
        
        beforeEach(() => {
            jest.resetModules();
            process.env = { ...process.env, ...ENVs };
        });
    
    
        test('get secerts', async () => {
            const result = await env.env_secretMangerClient.getSecrets();
            expect(result).toStrictEqual(SecretString);
        });

        test('get secerts with not all the required fields', async () => {
            delete process.env.HOST;
            await expect(env.env_secretMangerClient.getSecrets()).rejects.toThrow('Please set the next variable/s in your secret manger: HOST');
        });

    });
    
    describe('AWS - Secrect Manger Client', () => {
        
        beforeEach(() => {
            jest.resetModules();
            SecretsManagerMock.reset();
        });

        test('get secerts', async () => {
            const secretsLikeinAWS = {...SecretString , DB: SecretString.db , SECRET_KEY: SecretString.secretKey }
            SecretsManagerMock.on(GetSecretValueCommand).resolves({ SecretString : JSON.stringify(secretsLikeinAWS) });
            const result = await env.aws_secretMangerClient.getSecrets();
            expect(result).toStrictEqual(SecretString);
        });

        test('get secerts with not all the required fields', async () => {
            const brokenSecret = {...SecretString , DB: SecretString.db , SECRET_KEY: SecretString.secretKey }
            delete brokenSecret.host;
            SecretsManagerMock.on(GetSecretValueCommand).resolves({ SecretString : JSON.stringify(brokenSecret) });
            await expect(env.aws_secretMangerClient.getSecrets()).rejects.toThrow('Error occurred retrieving secerts: Error: Please set the next variable/s in your secret manger: host');
        });

    });

    const env = {
    };


    beforeAll(function() {
        env.aws_secretMangerClient = new SecretMangerClientAWS();
        env.env_secretMangerClient = new SecretMangerClientENV();
    });

})

