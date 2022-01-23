const { create } = require('./factory')
const { createAuthConfigReader } = require('./auth_factory')
const CommonConfigReader = require('./readers/common_config_reader')


const readCommonConfig = () => new CommonConfigReader().readConfig()

module.exports = { create, readCommonConfig, createAuthConfigReader }
