const { Uninitialized } = require('test-commons');
const { env,secretMangerTestEnvInit,secretMangerTestAWSEnvInit,secretMangerTestGCPEnvInit,secretMangerTestAzureEnvInit} = require("./resources/resources_provider")
const each = require('jest-each').default

const Chance = require('chance');
const chance = Chance();

describe('SECRET MANGER', () => {

    each([
        ['ENV', secretMangerTestEnvInit],
        ['AWS', secretMangerTestAWSEnvInit],
        ['GCP', secretMangerTestGCPEnvInit],
        ['Azure', secretMangerTestAzureEnvInit],
    ]).describe('%s', (name, setup) => {

        afterEach(()=>{
            env.driver.restore();
        });
        
        beforeAll(async () => {
            await setup()
        }, 20000);

        test('get secret with secret client', async () => {
            env.driver.stubSecret(env.testHelper.serviceFormat(ctx.secret));
            const result = await env.secretClient.getSecrets();
            expect(result).toEqual( env.testHelper.secretClientFormat(ctx.secret) );
        });

        test('get secert without all the required fields', async () => {
            const secret = env.testHelper.serviceFormat(ctx.secret);
            const {deletedKey} = env.driver.stubBrokenSecret(secret);
            await expect(env.secretClient.getSecrets()).rejects.toThrow(`Please set the next variable/s in your secret manger: ${deletedKey}`);
        });

        test('get secert with a field that is empty', async () => {
            const secret = env.testHelper.serviceFormat(ctx.secret);
            const {clearedKey} = env.driver.stubSecretWithEmptyField(secret);
            await expect(env.secretClient.getSecrets()).rejects.toThrow(`Please set the next variable/s in your secret manger: ${clearedKey}`);
        });

        const ctx = {
            secret: Uninitialized,
        };
        
        beforeEach(async () => {
            const host = chance.url();
            ctx.secret = {
                HOST: host,
                USER: chance.first(),
                PASSWORD: chance.guid(),
                SECRET_KEY: chance.guid(),
                DB: chance.word(),
            }
        });



    })
})