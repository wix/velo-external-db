import DataProvider from './airtable_data_provider'
import SchemaProvider from './airtable_schema_provider'
import FilterParser from './sql_filter_transformer'
import DatabaseOperations from './airtable_operations'
import * as Airtable from 'airtable'
import { DbProviders } from '@wix-velo/velo-external-db-types'


interface AirtableConfig {
    apiPrivateKey: string
    baseId: string
    metaApiKey: string
    baseUrl?: string
}

const extraOptions = (cfg: AirtableConfig) => {
    if (cfg.baseUrl)
        return { endpointUrl: cfg.baseUrl }
    return {}
}

export default async(cfg: AirtableConfig, _cfgOptions: { [x: string]: any }): Promise<DbProviders<Airtable.Base>> => {
    const options = _cfgOptions || {}
    const airtableBase = new Airtable({ apiKey: cfg.apiPrivateKey, ...extraOptions(cfg), ...options }).base(cfg.baseId)
    const databaseOperations = new DatabaseOperations(airtableBase)
    const filterParser = new FilterParser()
    const dataProvider = new DataProvider(airtableBase, filterParser)
    const schemaProvider = new SchemaProvider(airtableBase, { apiKey: cfg.apiPrivateKey, metaApiKey: cfg.metaApiKey, baseUrl: cfg.baseUrl })
    return { dataProvider, schemaProvider, connection: airtableBase, databaseOperations, cleanup: async() => { } }
}
