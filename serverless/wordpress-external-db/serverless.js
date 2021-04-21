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
                             const { collectionName } = req.body
                             let items = [];
                             if (collectionName === 'media') {
                                 items = await service.retrieveMedia(0, 20)
                             } else if (collectionName === 'categories') {
                                 items = await service.retrieveCategories(0, 20)
                             } else if (collectionName === 'posts') {
                                 items = await service.retrievePosts(0, 20)
                             }
                             items.forEach( patchEntities )

                             return { items: items, totalCount: 0 }
                         })
                         .addWebFunction('POST', '/data/get', async (ctx, req) => {
                             const { collectionName, itemId } = req.body
                             let items = [];
                             if (collectionName === 'media') {
                                 items = await service.retrieveMedia(0, 20)
                             } else if (collectionName === 'categories') {
                                 items = await service.retrieveCategories(0, 20)
                             } else if (collectionName === 'posts') {
                                 items = await service.retrievePosts(0, 20)
                             }
                             items.forEach( patchEntities )

                             return { item: items.find(i => i._id === itemId) }
                         })
                         .addWebFunction('POST', '/data/count', async (ctx, req) => { return { totalCount: 0 } })
                         .addWebFunction('POST', '/data/insert', async (ctx, req) => { return { item: { } } })
                         .addWebFunction('POST', '/data/update', async (ctx, req) => { return { item: { } } })
                         .addWebFunction('POST', '/data/remove', async (ctx, req) => { return { item: { } } })
