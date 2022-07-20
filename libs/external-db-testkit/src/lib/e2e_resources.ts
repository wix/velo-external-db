import { Uninitialized, sleep } from '@wix-velo/test-commons'
import { ConnectionCleanUp, IImplementationResources } from '@wix-velo/velo-external-db-types';
import { Router } from 'express';
import { ExternalDbRouter } from '@wix-velo/velo-external-db-core'
import { Server } from 'http';
import { authInit } from './auth_test_support';

type InitFunc = () => Promise<{ server: Server, externalDbRouter: ExternalDbRouter, cleanup: ConnectionCleanUp, [x: string]: any }>

export default class E2EResources {
    implementation: IImplementationResources;
    initFunc: InitFunc;
    env!: {
        server: Server, externalDbRouter: ExternalDbRouter, cleanup: ConnectionCleanUp, [x: string]: any
    };
    externalDbRouter!: ExternalDbRouter;

    constructor(implementation: IImplementationResources, initFunc: InitFunc) {
        this.implementation = implementation;
        this.initFunc = initFunc;
    }

    async initEnv() {
        await this.implementation.initEnv()
    }

    async shutdownEnv() {
        await this.implementation.shutdownEnv()
    }

    async initApp() {
        if (this.env) {
            await this.env.server.close()
        }
        authInit()
        this.env = await this.initFunc()
        this.env.externalDbRouter = this.env.externalDbRouter
    }

    async dbTeardown() {
        await this.env.cleanup()
    }

    async teardownApp() {
        await sleep(500)
        await this.env.server.close()
    }

    async dbInit() {
        await this.implementation.cleanup()
        this.implementation.setActive()
    }

    supportedOperations() {
        return this.implementation.supportedOperations()
    }
}
