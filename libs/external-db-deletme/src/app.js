const express = require('express')
const { ExternalDbRouter } = require('@wix-velo/velo-external-db-core')
const { mySqlFactory } = require('@wix-velo/external-db-mysql')

const main = async() => {
    const { connector: engineConnector, cleanup } = await mySqlFactory({
        user: 'test-user',
        host: 'localhost',
        password: 'password',
        db: 'test-db'
    })

    const externalDbRouter = new ExternalDbRouter({
        connector: engineConnector,
        config: {
            secretKey: 'secretKey'
        },
        hooks: {
            dataHooks: {
                beforeAll: (payload, requestContext, _serviceContext) => {
                    const msid = requestContext.instanceId
                    if (payload.item && rejectByInstance(payload.item, msid)) {
                        throw new Error('Rejected by instance')
                    }
                    if (payload.items && payload.items.some(item => rejectByInstance(item, msid))) {
                        throw new Error('Rejected by instance')
                    }
                },
                beforeRead: (payload, requestContext, _serviceContext) => {
                    console.log(requestContext)
                    if ((requestContext.operation === 'getById')) return
                    if ((requestContext.collectionName === 'Account_Content' || requestContext.collectionName.includes('Master_Content_'))) return

                    const msid = requestContext.instanceId

                    return { ...payload, filter: buildNewFilter(msid, payload.filter) }
                },

                beforeWrite: (payload, requestContext, _serviceContext) => {
                    const msid = requestContext.instanceId
                    if (requestContext.operation === 'insert' && !payload.item[UNIQEFIELD])
                        return { ...payload, item: { ...payload.item, [UNIQEFIELD]: msid } }
                    if (requestContext.operation === 'bulkInsert') {
                        return {
                            ...payload, items: payload.items.map(item => (!item[UNIQEFIELD] ? { ...item, [UNIQEFIELD]: msid } : item))
                        }
                    }
                }
            }
        }
    })

    const app = express()
    app.use(externalDbRouter.router)

    const server = app.listen(8080, () => console.log('Listening on port 8080'))
    
    return { server, externalDbRouter, cleanup }
}

const UNIQEFIELD = 'msid'

const createIndexedFilter = (instanceId) => {
    return {
        [UNIQEFIELD]: { $eq: instanceId }
    }
}

const buildNewFilter = (msid, filter) => {
    const indexedFilter = createIndexedFilter(msid)
    return isEmptyFilter(filter) ? indexedFilter : { $and: [indexedFilter, filter] }
}

const isEmptyFilter = (filter) => {
    return (Object.keys(filter).length === 0)
}

const rejectByInstance = (item, instanceId) => {
    return !(item && item[UNIQEFIELD] && item[UNIQEFIELD] === instanceId)
}

module.exports = { main }