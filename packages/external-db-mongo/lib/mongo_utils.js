const EMPTY_FILTER = {filterExpr:{}}
const notConnectedPool = (err) => {
    return {
        db: ()=> { throw err },
    }
}
module.exports = { EMPTY_FILTER, notConnectedPool }
