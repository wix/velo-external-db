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

        const posts = await service.retrievePosts()
        return { posts: posts/*[{ id: '1'}]*/ };
    }

    async media (aspects, req) {
        const ctx = this.rpcContext.contextProvider(aspects);
        ctx.logger.debug(`req ${JSON.stringify(req)}`);

        const media = await service.retrieveMedia()
        // console.log(JSON.stringify(media[0]))
        return { media: media };
    }
}

module.exports = fb => fb.addGrpcService(WordPressServiceImpl);