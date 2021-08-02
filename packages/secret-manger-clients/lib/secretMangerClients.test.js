
const {secretMangerTestHelper,secertMangerAWShelper,randomSecret} = require('./secretMangerClients_test_support');

describe('Secrect Manger Clients', () => {
    
    describe('Secrect Manger Client', () => {
        
        beforeEach(() => {        
            const {secretCapitalized,secretUncapitalized} = randomSecret();
            ctx.secretCapitalized = secretCapitalized;
            ctx.secretUncapitalized = secretUncapitalized;   
            secretMangerTestHelper.loadSecret(ctx.secretCapitalized);
        });

        test('get secret with secret client', async () => {
            const result = await env.secretMangerClient.getSecrets();
            expect(result).toStrictEqual(ctx.secretUncapitalized);
        });

        test('get secerts without all the required fields', async () => {
            const { deletedKey } = secretMangerTestHelper.deleteRandomSecertKey(ctx.secretCapitalized);
            await expect(env.secretMangerClient.getSecrets()).rejects.toThrow(`Please set the next variable/s in your secret manger: ${deletedKey}`);
        });

        test('get secerts with a field that is empty', async () => {
            const keyToClear = secretMangerTestHelper.clearRandomSecretKey(ctx.secretCapitalized);
            await expect(env.secretMangerClient.getSecrets()).rejects.toThrow(`Please set the next variable/s in your secret manger: ${keyToClear}`);
        });

    });

    describe('AWS - Secrect Manger Client', () => {
        beforeEach(() => 
        {   
            const {secretUncapitalized,secertsLikeAWS} = randomSecret();
            ctx.secretUncapitalized = secretUncapitalized;
            ctx.secertsLikeAWS = secertsLikeAWS;  
            ctx.awsSdkSecretMangerSendStub = secertMangerAWShelper.awsSdkSecretMangerSendStub(env.secretMangerClientAWS);      
            secertMangerAWShelper.loadSecret(ctx.awsSdkSecretMangerSendStub ,ctx.secertsLikeAWS);
        });

        afterEach(()=>{
            ctx.awsSdkSecretMangerSendStub.restore();

        });

        test('get secret with aws secret client', async () => {
            const result = await env.secretMangerClientAWS.getSecrets();
            expect(result).toStrictEqual(ctx.secretUncapitalized);
        });

        test('get secerts without all the required fields', async () => {
            const deletedKey =  secertMangerAWShelper.deleteRandomSecertKey(ctx.awsSdkSecretMangerSendStub ,ctx.secertsLikeAWS);
            await expect(env.secretMangerClientAWS.getSecrets()).rejects.toThrow(`Error occurred retrieving secerts: Error: Please set the next variable/s in your secret manger: ${deletedKey}`);
        });
        test('get secerts with a field that is empty', async () => {
            const keyToClear = secertMangerAWShelper.clearRandomSecretKey(ctx.awsSdkSecretMangerSendStub ,ctx.secertsLikeAWS);
            await expect(env.secretMangerClientAWS.getSecrets()).rejects.toThrow(`Error occurred retrieving secerts: Error: Please set the next variable/s in your secret manger: ${keyToClear}`);
        });
    });

    describe('GCP - Secrect Manger Client', () => {
        
        beforeEach(() => {        
            const {secertsLikeGCPCapitalized, secertsLikeGCPUncapitalized} = randomSecret();
            ctx.secertsLikeGCPCapitalized = secertsLikeGCPCapitalized;
            ctx.secertsLikeGCPUncapitalized = secertsLikeGCPUncapitalized;   
            secretMangerTestHelper.loadSecret(ctx.secertsLikeGCPCapitalized );

        });

        test('get secret with GCP secret client', async () => {
            const result = await env.secretMangerClientGCP.getSecrets();
            expect(result).toStrictEqual(ctx.secertsLikeGCPUncapitalized);
        });

        test('get secerts without all the required fields', async () => {
            const { deletedKey } = secretMangerTestHelper.deleteRandomSecertKey(ctx.secertsLikeGCPCapitalized);
            await expect(env.secretMangerClientGCP.getSecrets()).rejects.toThrow(`Please set the next variable/s in your secret manger: ${deletedKey}`);
        });

        test('get secerts with a field that is empty', async () => {
            const keyToClear = secretMangerTestHelper.clearRandomSecretKey(ctx.secertsLikeGCPCapitalized);
            await expect(env.secretMangerClientGCP.getSecrets()).rejects.toThrow(`Please set the next variable/s in your secret manger: ${keyToClear}`);
        });

    });


    const ctx = { 
    }; 

    const env = {
    };

    beforeAll(() =>  {
        const { SecretMangerClient , SecretMangerClientAWS, SecretMangerClientGCP } = require('./secretMangerClients');
        env.secretMangerClient = new SecretMangerClient();
        env.secretMangerClientAWS = new SecretMangerClientAWS('DB_INFO','us-east-1');
        env.secretMangerClientGCP = new SecretMangerClientGCP();
    });

})

