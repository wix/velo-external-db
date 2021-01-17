#!/usr/bin/env node

const path = require('path');
const {google} = require('googleapis');
const run = google.run('v1');
const sql = google.sql('v1beta4');



const createCloudRun = async (projectId, projectName) => {
    const res = await run.namespaces.services.create({
        parent: `namespaces/${projectId}`,

        requestBody: {
            apiVersion: 'serving.knative.dev/v1',
            kind: 'Service',
            metadata: {
              name: projectName,
              namespace: projectId,
            },
            spec: {
                template: {
                    /*
                    annotations:
        run.googleapis.com/client-name: cloud-console
        run.googleapis.com/cloudsql-instances: corvid-dal:us-central1:noamtest-12312344
        autoscaling.knative.dev/maxScale: '1000'
                     */
                    spec: {
                      serviceAccountName: '338394426103-compute@developer.gserviceaccount.com',
                      containers: [ {
                          image: 'gcr.io/corvid-dal/helloworld',
                          // image: 'us-docker.pkg.dev/cloudrun/container/hello',

                          /*
                          containers:
      - image: gcr.io/corvid-dal/helloworld
        ports:
        - containerPort: 8080
        env:
        - name: NAME
          value: xxxxxxxxxxxx
                           */
                      } ]
                    }
                },
            },
        },
    }, {
        rootUrl: 'https://us-central1-run.googleapis.com',
    }).catch(error => {
        console.log(error.response.data.error)
    });
    console.log(res.data);
}

const createCloudSql = async (projectId, projectName) => {
    /*
    MySQL instances: MYSQL_8_0, MYSQL_5_7 (default), or MYSQL_5_6.
PostgreSQL instances: POSTGRES_9_6, POSTGRES_10, POSTGRES_11 or POSTGRES_12 (

    rootPassword

     */

    /*const res = */await sql.instances.insert({
        project: projectId,

        //databaseVersion
        requestBody: {
            name: projectName,
            settings: {
                tier: 'db-n1-standard-1',
                ipConfiguration: {
                    // requireSsl
                    authorizedNetworks: [],
                },
                // locationPreference
            },
        },
    }).catch(error => {
        console.log(error.response.data.error)
    });
    // console.log(res.data);

}


async function main() {

    const auth = new google.auth.GoogleAuth({
        keyFile: path.join(__dirname, "corvid-dal-3b577728d4d5.json"),
        // Scopes can be specified either as an array or as a single, space-delimited string.
        scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/sqlservice.admin'],
    });

    // https://www.googleapis.com/auth/cloud-platform
    //     https://www.googleapis.com/auth/sqlservice.admin

    const authClient = await auth.getClient();
    google.options({auth: authClient});

    const projectId = await auth.getProjectId();

    const projectName = 'noamtest-121212'

    await createCloudRun(projectId, projectName)
    // todo: enable: Cloud SQL Admin API
    await createCloudSql(projectId, projectName)

}

main().catch(e => {
                    console.error(e);
                    throw e;
            })
      .then(() => console.log( "Done!" ));
