const { create } = require('./factory')
const CommonConfigReader = require('./common_config_reader')


const readCommonConfig = () => new CommonConfigReader().getSecrets()

module.exports = { create, readCommonConfig }
