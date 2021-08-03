
const { Uninitialized } = require('test-commons');
const {secretMangerTestHelper,secertMangerAWShelper,randomSecret} = require('./secretMangerClients_test_support');
const { SecretMangerClient , SecretMangerClientAWS, SecretMangerClientGCP } = require('./secretMangerClients');


describe('Secrect Manger Clients', () => {
    
    describe('Secrect Manger Client', () => {
        
        beforeEach(() => {        
            const { secretCapitalized,secretUncapitalized } = randomSecret();
            ctx.secretsInSecretMangerService = secretCapitalized;
            ctx.expectedSecretsFromClient = secretUncapitalized;     
            secretMangerTestHelper.loadSecret(ctx.secretsInSecretMangerService);
        });

        test('get secret with secret client', async () => {
            const result = await env.secretMangerClient.getSecrets();
            expect(result).toStrictEqual(ctx.expectedSecretsFromClient);
        });

        test('get secerts without all the required fields', async () => {
            const deletedKey = secretMangerTestHelper.deleteRandomSecertKey(ctx.secretsInSecretMangerService);
            await expect(env.secretMangerClient.getSecrets()).rejects.toThrow(`Please set the next variable/s in your secret manger: ${deletedKey}`);
        });

        test('get secerts with a field that is empty', async () => {
            const keyToClear = secretMangerTestHelper.clearRandomSecretKey(ctx.secretsInSecretMangerService);
            await expect(env.secretMangerClient.getSecrets()).rejects.toThrow(`Please set the next variable/s in your secret manger: ${keyToClear}`);
        });

    });

    describe('AWS - Secrect Manger Client', () => {
        beforeEach(() => 
        {   
            const {secretUncapitalized,secertsLikeAWS} = randomSecret();
            ctx.secretsInSecretMangerService = secertsLikeAWS;
            ctx.expectedSecretsFromClient = secretUncapitalized;  
            ctx.stubAwsSdkSecertManger = secertMangerAWShelper.awsSdkSecretMangerSendStub(env.secretMangerClientAWS);      
            secertMangerAWShelper.loadSecret(ctx.stubAwsSdkSecertManger ,ctx.secretsInSecretMangerService);
        });

        afterEach(()=>{
            ctx.stubAwsSdkSecertManger.restore();

        });

        test('get secret with aws secret client', async () => {
            const result = await env.secretMangerClientAWS.getSecrets();
            expect(result).toStrictEqual(ctx.expectedSecretsFromClient);
        });

        test('get secerts without all the required fields', async () => {
            const deletedKey =  secertMangerAWShelper.deleteRandomSecertKey(ctx.stubAwsSdkSecertManger ,ctx.secretsInSecretMangerService);
            await expect(env.secretMangerClientAWS.getSecrets()).rejects.toThrow(`Error occurred retrieving secerts: Error: Please set the next variable/s in your secret manger: ${deletedKey}`);
        });
        test('get secerts with a field that is empty', async () => {
            const keyToClear = secertMangerAWShelper.clearRandomSecretKey(ctx.stubAwsSdkSecertManger ,ctx.secretsInSecretMangerService);
            await expect(env.secretMangerClientAWS.getSecrets()).rejects.toThrow(`Error occurred retrieving secerts: Error: Please set the next variable/s in your secret manger: ${keyToClear}`);
        });
    });

    describe('GCP - Secrect Manger Client', () => {
        
        beforeEach(() => {        
            const {secertsLikeGCPCapitalized, secertsLikeGCPUncapitalized} = randomSecret();
            ctx.secretsInSecretsMangerService = secertsLikeGCPCapitalized;
            ctx.expectedSecretsFromClient = secertsLikeGCPUncapitalized;   
            secretMangerTestHelper.loadSecret( ctx.secretsInSecretsMangerService );

        });

        test('get secret with GCP secret client', async () => {
            const result = await env.secretMangerClientGCP.getSecrets();
            expect(result).toStrictEqual(ctx.expectedSecretsFromClient);
        });

        test('get secerts without all the required fields', async () => {
            const deletedKey = secretMangerTestHelper.deleteRandomSecertKey(ctx.secretsInSecretsMangerService);
            await expect(env.secretMangerClientGCP.getSecrets()).rejects.toThrow(`Please set the next variable/s in your secret manger: ${deletedKey}`);
        });

        test('get secerts with a field that is empty', async () => {
            const keyToClear = secretMangerTestHelper.clearRandomSecretKey(ctx.secretsInSecretsMangerService);
            await expect(env.secretMangerClientGCP.getSecrets()).rejects.toThrow(`Please set the next variable/s in your secret manger: ${keyToClear}`);
        });

    });


    const ctx = { 
        secretsInSecretsMangerService: Uninitialized,
        expectedSecretsFromClient: Uninitialized,
    }; 

    const env = {
    };

    beforeAll(() =>  {
        env.secretMangerClient = new SecretMangerClient();
        env.secretMangerClientAWS = new SecretMangerClientAWS('DB_INFO','us-east-1');
        env.secretMangerClientGCP = new SecretMangerClientGCP();
    });

})

