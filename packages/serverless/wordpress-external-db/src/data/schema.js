const postsDb = { id: 'posts',
    fields: [
        {name: '_id', type: 'text', isPrimary: true},
        {name: '_createdDate', type: 'datetime', isPrimary: false},
        {name: '_updatedDate', type: 'datetime', isPrimary: false},
        {name: '_owner', type: 'text', isPrimary: false},
        {name: 'slug', type: 'text', isPrimary: false},
        {name: 'status', type: 'text', isPrimary: false},
        {name: 'title', type: 'text', isPrimary: false},
        {name: 'content', type: 'text', isPrimary: false},
        {name: 'excerpt', type: 'text', isPrimary: false},
    ] }


const mediaDb = { id: 'media',
    fields: [
        {name: '_id', type: 'text', isPrimary: true},
        {name: '_createdDate', type: 'datetime', isPrimary: false},
        {name: '_updatedDate', type: 'datetime', isPrimary: false},
        {name: '_owner', type: 'text', isPrimary: false},
        {name: 'url', type: 'text', isPrimary: false},
        {name: 'caption', type: 'text', isPrimary: false},
        {name: 'details', type: 'object', isPrimary: false},
    ] }

const categoriesDb = { id: 'categories',
    fields: [
        {name: '_id', type: 'text', isPrimary: true},
        {name: '_createdDate', type: 'datetime', isPrimary: false},
        {name: '_updatedDate', type: 'datetime', isPrimary: false},
        {name: '_owner', type: 'text', isPrimary: false},
        {name: 'slug', type: 'text', isPrimary: false},
        {name: 'name', type: 'text', isPrimary: false},
        {name: 'count', type: 'number', isPrimary: false},

    ] }


module.exports = { dbs: [ postsDb, mediaDb, categoriesDb ] }