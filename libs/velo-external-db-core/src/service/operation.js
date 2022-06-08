class OperationService {
    constructor(databaseOperation) {
        this.databaseOperation = databaseOperation
    }

    async validateConnection() {
        return await this.databaseOperation.validateConnection()
    }

    async connectionStatus() {
        const connectionStatus = await this.databaseOperation.validateConnection()
        if (connectionStatus.valid) {
            return {
                status: 'Connected to database successfully'
            }
        }
        return {
            error: connectionStatus.error.message,
        }
    }
}

module.exports = OperationService