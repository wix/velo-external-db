const { com } = require('./generated/proto-generated.js');
const WordPressService = require('./src/service/wordpress-service');

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

module.exports = fb => fb.addGrpcService(WordPressServiceImpl);