const { Uninitialized, gen } = require('test-commons');
const { env, secretMangerTestEnvInit, secretMangerTestAWSEnvInit, secretMangerTestGCPEnvInit } = require("./resources/resources_provider")
const each = require('jest-each').default
const errors = require ('../lib/errors')

describe('SECRET MANGER', () => {

    each([
        ['ENV', secretMangerTestEnvInit],
        ['AWS', secretMangerTestAWSEnvInit],
        ['GCP', secretMangerTestGCPEnvInit],
    ]).describe('%s', (name, setup) => {

        afterEach(() => {
            env.driver.restore()
        });

        beforeAll(async () => {
            await setup()
        }, 20000);

        test('get secret with secret client', async () => {
            env.driver.stubSecret(env.testHelper.serviceFormat(ctx.secret))
            const result = await env.secretClient.readConfig()
            expect(result).toEqual(env.testHelper.secretClientFormat(ctx.secret))
        });

        test('get secret without all the required fields', async () => {
            const secret = env.testHelper.serviceFormat(ctx.secret)
            env.driver.stubBrokenSecret(secret)
            await expect(env.secretClient.readConfig()).rejects.toThrow(errors.MissingRequiredProps)
        });

        test('get secret with a field that is empty', async () => {
            const secret = env.testHelper.serviceFormat(ctx.secret)
            env.driver.stubSecretWithEmptyField(secret)
            await expect(env.secretClient.readConfig()).rejects.toThrow(errors.MissingRequiredProps)
        });

        const ctx = {
            secret: Uninitialized,
        };

        beforeEach(async () => {
            ctx.secret = gen.randomSecret()
        });

    })
})