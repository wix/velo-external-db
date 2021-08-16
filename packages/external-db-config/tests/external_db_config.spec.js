const { Uninitialized, gen } = require('test-commons');
const { env, secretMangerTestEnvInit, secretMangerTestAWSEnvInit, secretMangerTestGCPEnvInit } = require("./resources/resources_provider")
const each = require('jest-each').default
const errors = require('../lib/errors')

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
            const { deletedKey } = env.driver.stubBrokenSecret(secret)
            try {
                await env.secretClient.readConfig()
            } catch (error) {
                expect(error).toBeInstanceOf(errors.MissingRequiredProps)
                expect(error).toHaveProperty('missingProps', [deletedKey])
            }
        });

        test('get secret with a field that is empty', async () => {
            const secret = env.testHelper.serviceFormat(ctx.secret)
            const { clearedKey } = env.driver.stubSecretWithEmptyField(secret)
            try {
                await env.secretClient.readConfig()
            } catch (error) {
                expect(error).toBeInstanceOf(errors.MissingRequiredProps)
                expect(error).toHaveProperty('missingProps', [clearedKey])
            }
        });

        const ctx = {
            secret: Uninitialized,
        };

        beforeEach(async () => {
            ctx.secret = gen.randomSecret()
        });

    })
})