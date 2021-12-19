const AdapterOperators = { //should not be here - in data_common or something
    eq: 'eq',
    gt: 'gt',
    gte: 'gte',
    in: 'in', 
    lt: 'lt',
    lte: 'lte',
    ne: 'ne',
    string_begins: 'begins',
    string_ends: 'ends',
    string_contains: 'contains',
    and: 'and',
    or: 'or',
    not: 'not'
}

const EMPTY_FILTER = {}

module.exports = { AdapterOperators, EMPTY_FILTER }