const { AwsStrategy } = require('./strategies/aws_strategy')
const { GcpStrategy } = require('./strategies/gcp_strategy')

// require('dotenv').config()

const create = () => {
  const { AUTH_VENDOR: vendor, CALLBACKURL: callbackURL, CLIENTID: clientID, CLIENTSECRET: clientSecret, CLIENTDOMAIN: clientDomain } = process.env
  
  switch (vendor.toLowerCase()) {

    case 'aws':
      return new AwsStrategy({ callbackURL, clientDomain, clientID, clientSecret })

    case 'gcp':
      return new GcpStrategy({ clientID, clientSecret, callbackURL })

    case 'azure':
      break  
  }

}

module.exports = { create }
