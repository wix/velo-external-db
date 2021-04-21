const { com } = require('./generated/proto-generated.js');
const WordPressService = require('./src/service/wordpress-service');
const { dbs } = require('./src/data/schema')

const service = new WordPressService()

class WordPressServiceImpl extends com.wixpress.wordpress.WordPressService {
    constructor (rpcContext) {
        super();
        this.rpcContext = rpcContext;
    }

    async posts (aspects, req) {
        const ctx = this.rpcContext.contextProvider(aspects);
        ctx.logger.debug(`req ${JSON.stringify(req)}`);

        const posts = await service.retrievePosts(0, 20)
        return { posts: posts/*[{ id: '1'}]*/ };
    }

    async media (aspects, req) {
        const ctx = this.rpcContext.contextProvider(aspects);
        ctx.logger.debug(`req ${JSON.stringify(req)}`);

        const media = await service.retrieveMedia(0, 20)
        // console.log(JSON.stringify(media[0]))
        return { media: media };
    }

    async categories (aspects, req) {
        const ctx = this.rpcContext.contextProvider(aspects);
        ctx.logger.debug(`req ${JSON.stringify(req)}`);

        const categories = await service.retrieveCategories(0, 20)
        // console.log(JSON.stringify(media[0]))
        return { categories: categories };
    }
}

const patchEntities = item => {
        Object.defineProperty(item, '_id',
            Object.getOwnPropertyDescriptor(item, 'id'));
        delete item['id'];
}

module.exports = fb => fb.addGrpcService(WordPressServiceImpl)
                         .addWebFunction('POST', '/provision', async () => { return {} })
                         .addWebFunction('POST', '/schemas/list', async () => { return { schemas: dbs } })
                         .addWebFunction('POST', '/schemas/find', async (ctx, req) => {
                             const { schemaIds } = req.body
                             return { schemas: dbs.filter(item => schemaIds.includes( item.id )) } })
                         .addWebFunction('POST', '/data/find', async (ctx, req) => {
                             const { collectionName, skip, limit } = req.body
                             const _skip = skip || 0
                             const _limit = limit || 20
                             let resp = { items: [], totalCount: 0 };
                             if (collectionName === 'media') {
                                 resp = await service.retrieveMedia(_skip, _limit)
                             } else if (collectionName === 'categories') {
                                 resp = await service.retrieveCategories(_skip, _limit)
                             } else if (collectionName === 'posts') {
                                 resp = await service.retrievePosts(_skip, _limit)
                             }
                             resp.items.forEach( patchEntities )

                             return resp
                         })
                         .addWebFunction('POST', '/data/get', async (ctx, req) => {
                             const { collectionName, itemId } = req.body
                             const _skip = 0
                             const _limit = 20
                             let resp = { items: [], totalCount: 0 };
                             if (collectionName === 'media') {
                                 resp = await service.retrieveMedia(_skip, _limit)
                             } else if (collectionName === 'categories') {
                                 resp = await service.retrieveCategories(_skip, _limit)
                             } else if (collectionName === 'posts') {
                                 resp = await service.retrievePosts(_skip, _limit)
                             }
                             resp.items.forEach( patchEntities )

                             return { item: resp.items.find(i => i._id === itemId) }
                         })
                         .addWebFunction('POST', '/data/count', async (ctx, req) => {
                             const { collectionName } = req.body
                             const _skip = 0
                             const _limit = 20
                             let resp = { items: [], totalCount: 0 };
                             if (collectionName === 'media') {
                                 resp = await service.retrieveMedia(_skip, _limit)
                             } else if (collectionName === 'categories') {
                                 resp = await service.retrieveCategories(_skip, _limit)
                             } else if (collectionName === 'posts') {
                                 resp = await service.retrievePosts(_skip, _limit)
                             }

                             return { totalCount: resp.totalCount } })
                         .addWebFunction('POST', '/data/insert', async (ctx, req) => { return { item: { } } })
                         .addWebFunction('POST', '/data/update', async (ctx, req) => { return { item: { } } })
                         .addWebFunction('POST', '/data/remove', async (ctx, req) => { return { item: { } } })
