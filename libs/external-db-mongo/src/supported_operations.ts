import { AllSchemaOperations } from '@wix-velo/velo-external-db-commons'
import { SchemaOperations } from '@wix-velo/velo-external-db-types'
const notSupportedOperations = [SchemaOperations.AtomicBulkInsert]

export const supportedOperations = AllSchemaOperations.filter(op => !notSupportedOperations.includes(op))
