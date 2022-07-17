// path aliases within jest global setup/teardown
import { registerTsProject } from 'nx/src/utils/register'
registerTsProject('.', 'tsconfig.base.json')


import * as postgres from '../resources/engines/postgres_resources'
import * as mysql from '../resources/engines/mysql_resources'
import * as spanner from '../resources/engines/spanner_resources'
import * as firestore from '../resources/engines/firestore_resources'
import * as mssql from '../resources/engines/mssql_resources'
import * as mongo from '../resources/engines/mongo_resources'
import * as googleSheet from '../resources/engines/google_sheets_resources'
import * as airtable from '../resources/engines/airtable_resources'
import * as dynamoDb from '../resources/engines/dynamodb_resources'
import * as bigquery from '../resources/engines/bigquery_resources'

import { sleep } from '@wix-velo/test-commons'
import * as ci from './ci_utils'

const initEnv = async(testEngine: string) => {
    switch (testEngine) {
        case 'mysql':
            await mysql.initEnv()
            break

        case 'spanner':
            await spanner.initEnv()
            break

        case 'postgres':
            await postgres.initEnv()
            break

        case 'firestore':
            await firestore.initEnv()
            break

        case 'mssql':
            await mssql.initEnv()
            break

        case 'mongo':
            await mongo.initEnv()
            break
        case 'google-sheet':
            await googleSheet.initEnv()
            break

        case 'airtable':
            await airtable.initEnv()
            break
        
        case 'dynamodb':
            await dynamoDb.initEnv()
            break

        case 'bigquery':
            await bigquery.initEnv()
            break
    }
}

const cleanup = async(testEngine: string) => {
    switch (testEngine) {
        case 'mysql':
            await mysql.cleanup()
            break

        case 'spanner':
            await spanner.cleanup()
            break

        case 'postgres':
            await postgres.cleanup()
            break

        case 'firestore':
            await firestore.cleanup()
            break

        case 'mssql':
            await mssql.cleanup()
            break

        case 'google-sheet':
            await googleSheet.cleanup()
            break

        case 'mongo':
            await mongo.cleanup()
            break
        
        case 'dynamodb':
            await dynamoDb.cleanup()
            break

        case 'bigquery':
            await bigquery.cleanup()
            break
    }
}

export default async() => {
    const testEngine = process.env.TEST_ENGINE
    if (ci.LocalDev() || ci.engineWithoutDocker(testEngine)) {
        await initEnv(testEngine)

        await sleep(5000)
    }


    await cleanup(testEngine)
}
