import { IDatabaseOperations, ValidateConnectionResult, connectionStatusResult } from "@wix-velo/velo-external-db-types"

export interface IOperationService {
    validateConnection(): Promise<ValidateConnectionResult>
    connectionStatus(): Promise<connectionStatusResult>
}

export default class OperationService implements IOperationService {
    databaseOperation: IDatabaseOperations
    constructor(databaseOperation: any) {
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
            error: (connectionStatus as any).error.message //todo: fix this hack
        }
    }
}
