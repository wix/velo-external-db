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

// // *************** INFO **********************
//
// // *************** Data API **********************
// app.post('/data/find', async (req, res) => {
//     const { collectionName, filter, sort, skip, limit } = req.body
//     const data = await dataService.find(collectionName, filter, sort, skip, limit)
//     res.json(data)
// })
//
// app.post('/data/insert', async (req, res) => {
//     const { collectionName, item } = req.body
//     const data = await dataService.insert(collectionName, item)
//     res.json(data)
// })
//
// app.post('/data/get', async (req, res) => {
//     const { collectionName, itemId } = req.body
//     const data = await dataService.getById(collectionName, itemId)
//     res.json(data)
// })
//
// app.post('/data/update', async (req, res) => {
//     const { collectionName, item } = req.body
//     const data = await dataService.update(collectionName, item)
//     res.json(data)
// })
//
// app.post('/data/remove', async (req, res) => {
//     const { collectionName, itemId } = req.body
//     const data = await dataService.delete(collectionName, [itemId])
//     res.json(data)
// })
//
// app.post('/data/count', async (req, res) => {
//     const { collectionName, filter } = req.body
//     const data = await dataService.count(collectionName, filter)
//     res.json(data)
// })
// // ***********************************************
//
//


module.exports = fb => fb.addGrpcService(WordPressServiceImpl)
                         .addWebFunction('POST', '/provision', async () => { return {} })
                         .addWebFunction('POST', '/schemas/list', async () => { return { schemas: dbs } })
                         .addWebFunction('POST', '/schemas/find', async (ctx, req) => {
                             const { schemaIds } = req.body
                             return { schemas: dbs.filter(item => schemaIds.includes( item.id )) } })





// // *************** Schema API **********************
// app.post('/schemas/list', async (req, res) => {
//     const data = await schemaService.list()
//     res.json(data)
// })
//
// app.post('/schemas/find', async (req, res) => {
//     const { schemaIds } = req.body
//     const data = await schemaService.find(schemaIds)
//     res.json(data)
// })
//
// app.post('/schemas/create', async (req, res) => {
//     const { collectionName } = req.body
//     const data = await schemaService.create(collectionName)
//     res.json(data)
// })
//
// app.post('/schemas/column/add', async (req, res) => {
//     const { collectionName, column } = req.body
//     const data = await schemaService.addColumn(collectionName, column)
//     res.json(data)
// })
//
// app.post('/schemas/column/remove', async (req, res) => {
//     const { collectionName, columnName } = req.body
//     const data = await schemaService.removeColumn(collectionName, columnName)
//     res.json(data)
// })
// // ***********************************************