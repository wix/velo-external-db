const { escapeId } = require('mysql')
const { InvalidQuery } = require('velo-external-db-commons').errors

const wildCardWith = (n, char) => Array(n).fill(char, 0, n).join(', ')

const escapeTable = t => {
    if(t && t.indexOf('.') !== -1) {
        throw new InvalidQuery('Illegal table name')
    }
    return escapeId(t)
}

const extractGroupByNames = (projection) =>  projection.filter(f => !f.function).map( f => f.name ) 

const extractProjectionFunctionsObjects = (projection) => projection.filter(f => f.function)


module.exports = { wildCardWith, escapeId, escapeTable, extractGroupByNames, extractProjectionFunctionsObjects }
