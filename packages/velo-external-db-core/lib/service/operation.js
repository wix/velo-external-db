class OperationService {
    constructor(databaseOperation) {
        this.databaseOperation = databaseOperation;
    }

    validateConnection = async () => {
        return await this.databaseOperation.validateConnection()
    }

    connectionStatus = async () => {
        try {
            await this.databaseOperation.validateConnection()
            return "Connected to database successfully"
        } catch (e) {
            return `Connection to database failed, ${e.message}`
        }
    }

    config = () => {
        return this.databaseOperation.config();
    }
}

module.exports = OperationService