const postsDb = { id: 'posts',
    fields: [
        {name: '_id', type: 'text', isPrimary: true},
        {name: 'slug', type: 'text', isPrimary: false},
        {name: 'status', type: 'text', isPrimary: false},
        {name: 'title', type: 'text', isPrimary: false},
        {name: 'content', type: 'text', isPrimary: false},
        {name: 'excerpt', type: 'text', isPrimary: false},
    ] }

// switch (type) {
//     case 'varchar':
//     case 'text':
//         return 'text'
//     case 'decimal':
//     case 'bigint':
//     case 'int':
//         return 'number'
//     case 'tinyint':
//         return 'boolean'
//     case 'date':
//     case 'datetime':
//     case 'time':
//         return 'datetime'
//     case 'json':
//     default:
//         return 'object'

// }


// const mediaDb = { id: 'media',
//     fields: [
//         {name: chance.word(), type: chance.word(), isPrimary: chance.bool()},
//         {name: chance.word(), type: chance.word(), isPrimary: chance.bool()},
//     ] }
//
// const categoriesDb = { id: 'categories',
//     fields: [
//         {name: chance.word(), type: chance.word(), isPrimary: chance.bool()},
//         {name: chance.word(), type: chance.word(), isPrimary: chance.bool()},
//     ] }

/*
const randomDbField = () => ( {name: chance.word(), type: chance.word(), isPrimary: chance.bool()} )
const randomDbFields = () => randomArrayOf( randomDbField )

 */

module.exports = { dbs: [ postsDb ] }