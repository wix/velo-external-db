import { AllSchemaOperations } from '@wix-velo/velo-external-db-commons'
import { SchemaOperations } from '@wix-velo/velo-external-db-types'
//change column types - https://cloud.google.com/spanner/docs/schema-updates#supported_schema_updates
const notSupportedOperations = [SchemaOperations.QueryNestedFields, SchemaOperations.ChangeColumnType]

export const supportedOperations = AllSchemaOperations.filter(op => !notSupportedOperations.includes(op))
