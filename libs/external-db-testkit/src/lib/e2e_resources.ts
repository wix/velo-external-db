import { sleep } from '@wix-velo/test-commons'
import { ConnectionCleanUp, IImplementationResources, SchemaOperations } from '@wix-velo/velo-external-db-types'
import { ExternalDbRouter } from '@wix-velo/velo-external-db-core'
import { Server } from 'http'
import { authInit } from './auth_test_support'

type InitFunc = () => Promise<{ server: Server, externalDbRouter: ExternalDbRouter, cleanup: ConnectionCleanUp, [x: string]: any }>

export default class E2EResources {
    implementation: IImplementationResources
    initFunc: InitFunc
    env!: {
        server: Server, externalDbRouter: ExternalDbRouter, cleanup: ConnectionCleanUp, [x: string]: any
    }
    externalDbRouter!: ExternalDbRouter
    currentDbImplementationName: string
    supportedOperations: SchemaOperations[]
    constructor(implementation: IImplementationResources, initFunc: InitFunc) {
        this.implementation = implementation
        this.initFunc = initFunc
        this.currentDbImplementationName = this.implementation.name
        this.supportedOperations = this.implementation.supportedOperations
    }

    async globalSetUp() {
        await this.initEnv()
        await this.setUpDb()
        await this.initApp()
    }

    async globalTeardown() {
        await this.dbTeardown()
        await this.shutdownEnv()
        await this.teardownApp()
    }
    
    async initEnv() {
        await this.implementation.initEnv()
        await sleep(5000)
    }

    async setUpDb() {
        await this.implementation.cleanup()
        this.implementation.setActive()
    }

    async shutdownEnv() {
        await this.implementation.shutdownEnv()
    }

    async initApp() {
        process.env['CLOUD_VENDOR'] = 'azure'
        if (this.env) {
            console.log('closing server...')
            await this.env.server.close()
        }
        else{
            authInit()
        }
        this.env = await this.initFunc()
        return this.env
    }

    async dbTeardown() {        
        await this.env.cleanup()
    }

    async teardownApp() {
        await sleep(500)
        this.env.server.close()
    }

    async dbInit() {
        await this.implementation.cleanup()
        this.implementation.setActive()
    }
}
