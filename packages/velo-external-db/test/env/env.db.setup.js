const postgres = require("../resources/postgres_resources");
const mysql = require("../resources/mysql_resources");

module.exports = async () => {
    await mysql.initEnv()
    await postgres.initEnv()
};
