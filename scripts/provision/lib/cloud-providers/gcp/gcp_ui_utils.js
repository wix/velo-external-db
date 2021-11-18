const inquirer = require('inquirer')
const { nonEmpty } = require('../../cli/validators')
const {GoogleAuth} = require('google-auth-library')

const GCP = {
    gcpProjectId: 'corvid-managed-cfe9809c',
    gcpClientEmail: 'script-user@corvid-managed-cfe9809c.iam.gserviceaccount.com',
    gcpPrivateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCv1c6B07t1QRzd\nxUmU38xuvQn2XNlY13aBHBm6nIXJHvt1iAO04lmKrcnPtZxnU/Q2bMz6HVcOrlWk\nReou7ATEHdL/6erFM7pav24vi+N99hSRv3OzBpEjXpZbvQnW9HuAbtbSmk2IlFSz\n1WhLzkLl1cib0P9JqcKLz8Uw/Bq6cmyJr2jh8jiiJ1E1y8z7nK2992DLCWQ8QnJ9\nk5ujXvvdQgIOTjC9ATEpfktOSXltvmOYBJoGLFzoDK1ipW+w+5U6ppHIsPWOIJdU\nL49yQuHXL3SjxvffcXN/OhXfBob917MSzktb+7c+KO90i6bPs1DYOckVSCSxTytc\n0YqpsnzzAgMBAAECggEAD6xS2aGs45kSi0tgRq6Ng2Vtnjx30dfKzrFZiG0WmRnI\n4kNlyS7P5Ruekdl8qn0s7IOq4F8oeRIzEg8lU69isV8ohU/YHGHYVOnGrDhKO9pp\nH6CyyHISZ9ZbjVZ+ql66eh/nHXihkUYKKB7NSsyE4VsP+aDvJdAa8Olr3fTq0P7n\njLKD0djNGS0pKwpup2CzyKbs3tlMFpgX7ugnHw4IlJU2WbD6ro4kC+6Y3pKABIAr\ntvRLBHEB6g+07SkLqZA7sipCPmzCuguMDPj+EsoYFCO3s7OFZMi05oGlQRAW1bn0\nGt1gyKaW0hnqJPtaLNmkAR6meWYDbj5vOc5URlKyYQKBgQDYKUQvsnprqneoZ4aP\nk2deRnEtUuvc7cUz51KToLbM7GrL7agkvTIpU1O5+XEAi1Ykk/K5sdYfBOW/qYjT\nkKm1ezmqwXiblzPu2wQvgA5t+/vHsmJ2rbZ1Is/1cmWrTArqG7eWG7YmI9nIYJvS\nH8y4g5wMQgAypAKf1v3lyTjzAwKBgQDQPemhYYQWj+bVCyxCbQNfzCFTmff5kqQM\ndAn8/LCzds1pn7igSbAJMSEjy6JEMcM6ZPZfCJ/C5uw//99pTv76gZfNTaTHG3JB\nhlCBbALdfSqYtSBElpAiQeRrEV+jpyGIHW1n0HotfebI0aPR7pcqK3PCHHV4ebGu\nyjIYC2wzUQKBgF5rsCgxiv4KqVf7WLDQj3+Dv54vsW2AwvpIGi74LcFXp9LKTf82\nUXnxtwnuZqj5NDioE4d/oetMxVqyIF1hvG/Ukrz+48L7CilUrABfrG3oevOg/Reg\nC6og+bvaK4Tmo4Hdd5TvJ+KDGHdJk+b2EwOqIXjNP67fK3JMg/1ipyinAoGAIGTx\nOjSkSqo6G3wwd2jj9HwZ1xqFk+J2+KT4hM1+Y3ygucSqAO1VoChvYlUkOf2PxD6+\ngMwjpjssF0yjoYszaR7N0Zc5gevIG19cmLWHwJLfFIBgs6rEYz/i27EJMrkmIzmI\nsnSg/QCv7R+Hn3nBNEMsL88jiwlLVciIgGsOevECgYEAhLeC4h1Xck/W8m835yux\nOaHHojYvz04i2x0UK0sZP44BmS4KDaz+RKF1UkUhvmvcf+H7Zu1DdAkHCprnwAyq\nFlzLxGxYV7HjuF306lNi1Ulyl3XrfiIK7fPU8pLo2vscTag8R2m8SF7YJKXqKLpY\njkav2NUF3TA+nxMoDB3eijE=\n-----END PRIVATE KEY-----\n',
}

const credentials = async () => inquirer.prompt([
    {
        type: 'input',
        name: 'gcpClientEmail',
        message: 'GCP Client email',
        validate: nonEmpty,
        default: GCP.gcpClientEmail
    },
    {
        type: 'input',
        name: 'gcpPrivateKey',
        message: 'GCP Private Key',
        validate: nonEmpty,
        default: GCP.gcpPrivateKey
    },
    {
        type: 'input',
        name: 'gcpProjectId',
        message: 'GCP project id',
        validate: nonEmpty,
        default: GCP.gcpProjectId
    }
])

const region = async(credentials) => inquirer.prompt([
    {
        type: 'list',
        name: 'region',
        message: 'Region availability',
        choices: async() => await regionList(credentials)
    }
])


const regionList =async({ gcpClientEmail, gcpPrivateKey, gcpProjectId }) => {
    const authClient = new GoogleAuth({
        credentials : { client_email: gcpClientEmail, private_key: gcpPrivateKey },
        scopes: 'https://www.googleapis.com/auth/cloud-platform'
    })
    const RegionApiUrl = `https://compute.googleapis.com/compute/v1/projects/${gcpProjectId}/regions`

    const client = await authClient.getClient()
    const res = await client.request({ url: RegionApiUrl })

    return res.data.items.map(i => i.name)
}



module.exports = { credentials, region }