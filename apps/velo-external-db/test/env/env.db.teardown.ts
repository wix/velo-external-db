import * as postgres from '../resources/engines/postgres_resources'
import * as mysql from '../resources/engines/mysql_resources'
import * as spanner from '../resources/engines/spanner_resources'
import * as firestore from '../resources/engines/firestore_resources'
import * as mssql from '../resources/engines/mssql_resources'
import * as mongo from '../resources/engines/mongo_resources'
import * as googleSheet from '../resources/engines/google_sheets_resources'
import * as airtable from '../resources/engines/airtable_resources'
import * as dynamo from '../resources/engines/dynamodb_resources'
import * as ci from './ci_utils'

const shutdownEnv = async(testEngine: string) => {
    switch (testEngine) {
        case 'mysql':
            await mysql.shutdownEnv()
            break

        case 'spanner':
            await spanner.shutdownEnv()
            break

        case 'postgres':
            await postgres.shutdownEnv()
            break

        case 'firestore':
            await firestore.shutdownEnv()
            break

        case 'mssql':
            await mssql.shutdownEnv()
            break

        case 'google-sheet':
            await googleSheet.shutdownEnv()
            break

        case 'airtable':
            await airtable.shutdownEnv()
            break
        
        case 'dynamodb':
            await dynamo.shutdownEnv()
            break

        case 'mongo': 
            await mongo.shutdownEnv()
            break
    }
}

export default async() => {
    const testEngine = process.env.TEST_ENGINE
    if (ci.LocalDev() || ci.engineWithoutDocker(testEngine)) {
        await shutdownEnv(testEngine)
    }
}
