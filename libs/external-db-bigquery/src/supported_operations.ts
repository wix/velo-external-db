import { AllSchemaOperations } from '@wix-velo/velo-external-db-commons'
import { SchemaOperations } from '@wix-velo/velo-external-db-types'

const notSupportedOperations = [
    SchemaOperations.UpdateImmediately,
    SchemaOperations.DeleteImmediately,
    SchemaOperations.StartWithCaseInsensitive,
    SchemaOperations.PrimaryKey,
    SchemaOperations.ChangeColumnType,
]

export const supportedOperations = AllSchemaOperations.filter(op => !notSupportedOperations.includes(op))
