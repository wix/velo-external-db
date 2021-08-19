const postgres = require("../resources/postgres_resources");
const mysql = require("../resources/mysql_resources");
const spanner = require('../resources/spanner_resources')

module.exports = async () => {
    await spanner.initEnv()
    await mysql.initEnv()
    await postgres.initEnv()
};
