
class DatabaseOperations {
    constructor(doc) {
        this.doc = doc
    }

    async validateConnection() {
        return await this.doc.loadInfo()
                             .then(() => { return { valid: true } })
                             .catch(e => { return { valid: false, error: e } })
    }

}

module.exports = DatabaseOperations
