class OperationService {
    constructor(databaseOperation) {
        this.databaseOperation = databaseOperation;
    }

    async validateConnection() {
        return await this.databaseOperation.validateConnection()
    }

    async connectionStatus() {
        const connectionStatus = await this.databaseOperation.validateConnection()
        if (connectionStatus.valid) {
            return {
                STATUS: "Connected to database successfully",
                ...this.config()
            }
        }
        return {
            error: connectionStatus.error.message,
        }
    }

    config() {
        return this.databaseOperation.config();
    }
}

module.exports = OperationService