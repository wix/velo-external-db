const sinon = require('sinon');
const FilterParser = require('../../src/storage/gcp/sql/sql_filter_transformer')

const filterParser = sinon.createStubInstance(FilterParser)

const stubEmptyFilterFor = (filter) => {
    filterParser.transform.withArgs(filter).returns({ filterExpr: '', filterColumns: [], parameters: [] })
}

const stubEmptyOrderByFor = (sort) => {
    filterParser.orderBy.withArgs(sort).returns({ sortExpr: '', sortColumns: [] })
}

const givenOrderByFor = (column, sort) => {
    filterParser.orderBy.withArgs(sort).returns({ sortExpr: 'ORDER BY ?? ASC', sortColumns: [column] })
}


const givenFilterByIdWith = (id, filter) => {
    filterParser.transform.withArgs(filter).returns({ filterExpr: 'WHERE ?? = ?', filterColumns: ['_id'], parameters: [id] })
}

module.exports = { givenOrderByFor, stubEmptyOrderByFor, stubEmptyFilterFor, givenFilterByIdWith, filterParser }