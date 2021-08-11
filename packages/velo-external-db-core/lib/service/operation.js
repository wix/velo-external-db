class OperationService {
    constructor(databaseOperation) {
        this.databaseOperation = databaseOperation;
    }

    checkIfConnectionSucceeded = async () => {
        return await this.databaseOperation.checkIfConnectionSucceeded()
    }

    getConnectionStatusString = async () => {
        try {
            await this.databaseOperation.checkIfConnectionSucceeded()
            return "Connected to database successfully"
        } catch (e) {
            return `Connection to database failed, ${e.message}`
        }
    }

    getPoolConfig = () => {
        return this.databaseOperation.getPoolConfig();
    }
}

module.exports = OperationService