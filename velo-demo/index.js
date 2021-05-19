const Spinner = require('cli-spinner').Spinner;
const showBanner = require('node-banner');
const { google } = require("googleapis");
const { green, grey, greenBright, redBright } = require('chalk');
const { waitFor } = require("poll-until-promise");
const sql = google.sql("v1beta4");
const run = google.run("v1");
const cloudResourceManager = google.cloudresourcemanager("v1");
const inquirer = require('inquirer');
const fs = require('fs');

const serviceAccountRaw = fs.readFileSync("serviceAccountCredentials.json", "utf8");
const serviceAccount = JSON.parse(serviceAccountRaw)

const serviceAccountToken = new google.auth.JWT(
    serviceAccount.email,
    null,
    serviceAccount.key,
    [
        "https://www.googleapis.com/auth/logging.read",
        "https://www.googleapis.com/auth/cloud-platform",
        "https://www.googleapis.com/auth/cloudplatformprojects"
    ],
    null
);

const gpmUrl = 'https://manage.wix.com/_api/corvid-google-project-manager'

const axios = require('axios').default

const checkDbInstanceState = async (projectId, instanceId) => {
  const request = {
    auth: serviceAccountToken,
    project: projectId,
    instance: instanceId,
  };
  const res = await sql.instances.get(request);

  const { state } = res.data;

  switch (state) {
    case "PENDING_CREATE":
      return false;
    case "RUNNABLE":
      return true;
    default:
      throw new Error(`instance in unexpected state ${state}`);
  }
};

const provisionSql = async (authorization) => {
    const res = await axios.post(`${gpmUrl}/project/sql`, {
        projectName: 'Velo Test Project'
    }, { headers: {
            'Content-Type': 'application/json',
            'Authorization': authorization,
        }})

    return {
        instanceId: res.data.instanceId,
        projectId: res.data.projectId
    }
}

const startSpinnerWith = async (msg, f, completeMsg) => {
    const spinner = new Spinner({
        text: `\t\t %s ${msg}`,
        stream: process.stderr,
        onTick: function(msg){
            this.clearLine(this.stream);
            this.stream.write(msg);
        }
    })

    spinner.setSpinnerString(18)

    spinner.start()

    try {
        const res = await f()

        spinner.stop(true)

        process.stderr.write(`\t\t ${greenBright('✓')} ${grey(completeMsg || msg)}\n`)

        return res
    } catch (e) {
        spinner.stop(true)
        process.stderr.write(`\t\t ${redBright('✓')} ${grey(completeMsg || msg)}\n`)
        process.stderr.write(redBright('Process failed\n'))
        process.exit(1)
    }

}

const blockUntil = async f => {
    return waitFor(
        async () => {
            const response = await f()

            if (!response) {
                throw new Error("try again");
            }
        },
        {
            interval: 100,
            timeout: 10 * 60 * 1000,
            message: "Waiting for time to pass :)",
        }
    );
}

const blockUntilCloudSqlInitiated = (projectId, instanceId) => blockUntil(() => checkDbInstanceState(projectId, instanceId))

const retrieveServiceUrl = async (projectId, instanceId) => {
    await blockUntil(async () => {
        const s = await cloudRunUrl(projectId, instanceId)
        if (s === undefined) {
            throw new Error('try again')
        }
        return s
    } )

    const serviceUrl = await cloudRunUrl(projectId, instanceId)
    if (serviceUrl === undefined) {
        return await retrieveServiceUrl(projectId, instanceId)
    }
    return serviceUrl;
}

const blockUntilCloudRunAvailable = async (projectId, instanceId) => {
    const serviceUrl = await startSpinnerWith(`Wait until Cloud Run instance is available`, () => retrieveServiceUrl(projectId, instanceId), `Cloud Run instance is available`)

    if (serviceUrl === undefined) {
        throw new Error('error while retrieving service url')
    }

    await startSpinnerWith(`Wait until Cloud Run instance complete startup ${serviceUrl}`, () => blockUntil(() => axios.get(serviceUrl)), `Cloud Run instance started successfully.`)

    return serviceUrl
}


const provisionCloudRun = async (instanceId, secretKey, authorization) => {
    return await axios.post(`${gpmUrl}/project/cloud`, {
        projectName: 'Velo Test Project',
        instanceId: instanceId,
        secretKey: secretKey
    }, { headers: {
            'Content-Type': 'application/json',
            'Authorization': authorization,
        }})
}

const registerEndpointWithWix = async (serviceUrl, secretKey, authorization) => {
    await axios.post(`https://code.wix.com/_api/cloud-data/v1/connector/settings/register`, {
        id: { "namespace": "velo_demo"},
        endpoint: serviceUrl,
        configuration: { secretKey: secretKey }
    }, { headers: {
            'Content-Type': 'application/json',
            'Authorization': authorization,
        }})
}

//https://manage.wix.com/dashboard/0dbb9085-ba04-4548-8e07-b058f08c211b/payments-dashboard/?referralInfo=sidebar

const cloudRunUrl = async (projectId, instanceId) => {
    const request = {
        auth: serviceAccountToken,
        parent: `namespaces/${projectId}`,
        includeUninitialized: true,
    };

    const resp = await run.namespaces.services.list(request)

    if (resp.data.items) {
        const service = resp.data.items.find(i => i.metadata.name === instanceId)

        if (service) {
            return service.status.url
        }
    }
    return undefined;
}

const modifyCloudRunAuthorizationPolicy = async (projectId, instanceId) => {
    const locationId = 'us-central1'
    const request = {
        auth: serviceAccountToken,
        resource: `projects/${projectId}/locations/${locationId}/services/${instanceId}`,

        requestBody: {
            policy: {
                bindings: [{
                    role: "roles/run.invoker",
                    members: [ "allUsers" ]
                }]
          },
        }
    };

    await run.projects.locations.services.setIamPolicy(request, { rootUrl: 'https://us-central1-run.googleapis.com' })
}

const getProjectIAM = async (projectId) => {
    const request = {
        resource_: projectId,
        auth: serviceAccountToken,
    };

    const resp = await cloudResourceManager.projects.getIamPolicy(request)
    return resp.data
}

const setProjectIAM = async (projectId, bindings, version, etag) => {
    const request = {
        resource_: projectId,
        auth: serviceAccountToken,
        resource: {
            policy: {
                bindings: bindings,
                etag: etag,
                version: version,
            },
        },
    };

    const resp = await cloudResourceManager.projects.setIamPolicy(request)
    return resp.data

}
const patchingProjectAuthentication = async (projectId) => {
    const data = await getProjectIAM(projectId)

    const bindings = data.bindings.filter(b => !['roles/cloudsql.admin', 'roles/run.admin'].includes(b.role) )

    const r1 = {
        role: 'roles/cloudsql.admin',
        members: [
            "serviceAccount:corvid-operate-provisioning@corvid-api.iam.gserviceaccount.com",
            "user:noama@wix.com",
        ]
    }

    const r2 = {
        role: 'roles/run.admin',
        members: [
            "serviceAccount:corvid-operate-provisioning@corvid-api.iam.gserviceaccount.com",
            "user:noama@wix.com",
        ]
    }

    await setProjectIAM(projectId, [r1, r2, ...bindings], data.version, data.etag)
}

const createCollection = async (collectionName, secretKey, serviceUrl) => {
    return await axios.post(`${serviceUrl}/schemas/create`, {
        collectionName: collectionName,
        requestContext: {settings: {secretKey: secretKey}}
    })
}

const addColumnToCollection = async (collectionName, secretKey, serviceUrl) => {
    return await axios.post(`${serviceUrl}/schemas/column/add`, {
        collectionName: collectionName,
        requestContext: {settings: {secretKey: secretKey}},
        column: {name: 'demo_column', type: 'varchar(256)', isPrimary: false}
    })
}


const demo = async (authorization, msId, siteId, secretKey) => {

    console.log('')
    console.log('')
    console.log(`${green('[INFO]:')} Provision Cloud Sql and Cloud Run instances using Wix GCP`)

    const {instanceId, projectId} = await startSpinnerWith('Provision Cloud Sql instance', () => provisionSql(authorization), 'Cloud Sql instance created successfully.')

    await startSpinnerWith(`Waiting for Cloud Sql instance to start`, () => blockUntilCloudSqlInitiated(projectId, instanceId), `Cloud Sql instance started successfully.`)
    await startSpinnerWith(`Provisioning Cloud Run instance`, () => provisionCloudRun(instanceId, secretKey, authorization), `Cloud Run instance created successfully.`)

    console.log('')
    console.log(`${green('[INFO]:')} Cloud Sql instance created: ${instanceId} - https://console.cloud.google.com/sql/instances?project=${projectId}`)
    console.log(`${green('[INFO]:')} Cloud Run instance created: ${instanceId} - https://console.cloud.google.com/run?project=${projectId}`)


    console.log('')
    console.log('')
    console.log(`${green('[INFO]:')} Adjusting Cloud Run instance`)

    await startSpinnerWith(`Disable traffic authentication`, () => modifyCloudRunAuthorizationPolicy(projectId, instanceId), `Disable traffic authentication`)
    await startSpinnerWith(`Adjusting project security permissions`, () => patchingProjectAuthentication(projectId), `Adjusting project security permissions`)
    const serviceUrl = await blockUntilCloudRunAvailable(projectId, instanceId)

    console.log('')
    console.log(`${green('[INFO]:')} Cloud Run instance running at: ${serviceUrl}`)

    console.log('')
    console.log('')
    console.log(`${green('[INFO]:')} Creating Velo Db schema using schema API`)
    await startSpinnerWith(`Creating demo collection`, () => createCollection('demo_collection', secretKey, serviceUrl))
    await startSpinnerWith(`Adding Column to demo collection`, () => addColumnToCollection('demo_collection', secretKey, serviceUrl))

    console.log('')
    console.log('')
    console.log(`${green('[INFO]:')} Provision Wix Editor`)
    await startSpinnerWith(`Register external db to wix site`, () => registerEndpointWithWix(serviceUrl, secretKey, authorization))
    console.log('')
    console.log(`Open Editor: https://editor.wix.com/html/editor/web/renderer/edit/${siteId}?metaSiteId=${msId}`)
    console.log('')
    console.log('')
    console.log('')

    // open editor ???
    //https://editor.wix.com/html/editor/web/renderer/edit/5b8df24c-c62f-4681-ab34-ead3a684be71?metaSiteId=0dbb9085-ba04-4548-8e07-b058f08c211b
    /// https://manage.wix.com/  editor/fcb82488-ad73-494f-bb11-94691a2d9b94?editorSessionId=b26a27d2-5a1d-4248-a7d7-5bfb1c667aee
}

const login = async (user, pass) => {
    const resp = await axios.post('https://users.wix.com/auth/v2/login', `email=${user}&password=${pass}`)

    const session = resp.headers['set-cookie'].find(c => c.startsWith('wixSession'))
    if (!session) {
        console.log(redBright('Login failed\n'))

        process.exit(1)
    }

    return session
}

const siteForUser = async (session) => {
    const sites = await axios.get('https://manage.wix.com/account/sites/api/folder/root', { headers: {
            'Content-Type': 'application/json',
            'Cookie': session
        }})

    return sites.data.sites.map(s => ({ name: s.displayName, siteId: s.htmlWebId, msId: s.metaSiteId, editUrl: s.metaSiteId}))
}

const signedInstanceFor = async (msId, appId, session) => {
    const resp = await axios.get(`https://manage.wix.com/_api/business-manager/site/${msId}/embeddedServicesWithExpiration`,
                                 {
                                     headers: {
                                         'Content-Type': 'application/json',
                                         'Cookie': session
                                     },
                                     params: {
                                         'ms-id': msId
                                     }
                                 })

    return Object.values(resp.data.embeddedServices)
                 .find(s => s.appDefinitionId === appId)
                 .instance
}

const logicCredentials = () => inquirer.prompt([
    {
        type: 'input',
        message: 'User',
        name: 'user',
        default: 'fhvdamsr@sharklasers.com',
    },
    {
        type: 'password',
        message: 'Password',
        name: 'passwd',
        default: '123456',
    },
])

const siteForProvision = (user, passwd) => inquirer.prompt([
    {
        type: 'list',
        message: 'Select Site',
        choices: async () => {
            const session = await login(user, passwd)
            const sites = await siteForUser(session)

            return sites.map(s => ({
                key: s.msId,
                name: s.name,
                value: { site: s, session: session }
            }))
        },
        name: 'value',
    }
])

const CorvidAppDefId = '675bbcef-18d8-41f5-800e-131ec9e08762'

const randomStr = () => Math.random().toString(36).slice(2)

const main = async () => {
    await showBanner('Velo External DB', 'Demo for Velo External DB automation', 'blue', 'magenta')
    console.log('')
    console.log('')

    const { user, passwd } = await logicCredentials()
    const { value } = await siteForProvision(user, passwd)

    const instance = await signedInstanceFor(value.site.msId, CorvidAppDefId, value.session)
    const secretKey = randomStr()
    await demo(instance, value.site.msId, value.site.siteId, secretKey)
}

main()