import { AllSchemaOperations } from '@wix-velo/velo-external-db-commons'
import { SchemaOperations } from '@wix-velo/velo-external-db-types'
const notSupportedOperations = [SchemaOperations.NonAtomicBulkInsert]

export const supportedOperations = AllSchemaOperations.filter(op => !notSupportedOperations.includes(op))
