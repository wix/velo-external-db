import { ResponseField } from "@wix-velo/velo-external-db-types"

export type Field = {
    field: string,
    type: string,
    subtype?: string,
    precision?: number,
    isPrimary?: boolean,
}
