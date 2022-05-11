const { create } = require('./factory')
const CommonConfigReader = require('./readers/common_config_reader')

const { AuthorizationConfigValidator } = require ('./validators/authorization_config_validator')
const { CommonConfigValidator } = require('./validators/common_config_validator')
const { ConfigValidator } = require('./validators/config_validator')

const readCommonConfig = () => new CommonConfigReader().readConfig()

module.exports = { create, readCommonConfig, AuthorizationConfigValidator, CommonConfigValidator, ConfigValidator }
