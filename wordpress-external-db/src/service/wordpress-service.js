const WPAPI = require( 'wpapi' )

class WordPressService {
    constructor() {
        this.wp = new WPAPI({ endpoint: 'http://www.angrybirds.com/wp-json' })
    }

    async retrievePosts(skip, limit) {
        const posts = await this.wp.posts().offset( skip ).perPage( limit ).get()
        return posts.map( this.post2Dto )
    }

    async retrieveMedia(skip, limit) {
        const media = await this.wp.media().offset( skip ).perPage( limit ).get()
        return media.map( this.media2Dto )
    }

    async retrieveCategories(skip, limit) {
        const category = await this.wp.categories().offset( skip ).perPage( limit ).get()
        return category.map( this.category2Dto )
    }


    post2Dto(p) {
        return {
            id: p.id,
            slug: p.slug,
            status: p.status,
            title: p.title.rendered,
            content: p.content.rendered,
            excerpt: p.excerpt.rendered,
        }
    }

    media2Dto(p) {
        return {
            id: p.id,
            url: p.guid.rendered,
            caption: p.caption.rendered,
            details: Object.entries(p.media_details.sizes)
                           .map((k, v) => ({
                               name: k[0],
                               file: k[1].file,
                               width: k[1].width,
                               height: k[1].height,
                               type: k[1].mime_type,
                               url: k[1].source_url,
                           })),
        }
    }

    category2Dto(p) {
        return {
            id: p.id,
            count: p.count,
            name: p.name,
            slug: p.slug,
        }
    }
}

module.exports = WordPressService