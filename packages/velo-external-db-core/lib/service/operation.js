class OperationService {
    constructor(databaseOperation) {
        this.databaseOperation = databaseOperation;
    }

    getConnectionStatusString = async () => {
        try {
            await this.databaseOperation.checkIfConnectionSucceeded()
            return "Connected to database successfully"
        } catch (e) {
            return `Connection to database failed, ${e.message}`
        }
    }

    checkIfConnectionSucceeded = async () => {
        return this.databaseOperation.checkIfConnectionSucceeded()
    }
    
    getPoolConfig = () => {
        return this.databaseOperation.getPoolConfig();
    }
}

module.exports = OperationService