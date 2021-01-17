// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START cloudrun_helloworld_service]
// [START run_helloworld_service]
const express = require('express');
const mysql = require('promise-mysql');
const app = express();


const winston = require('winston');

// Imports the Google Cloud client library for Winston
const {LoggingWinston} = require('@google-cloud/logging-winston');

const loggingWinston = new LoggingWinston();

// Create a Winston logger that streams to Stackdriver Logging
// Logs will be written to: "projects/YOUR_PROJECT_ID/logs/winston_log"
const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(),
    // Add Stackdriver Logging
    loggingWinston,
  ],
});

const createTcpPool = async config => {
  // Extract host and port from socket address
  const dbSocketAddr = process.env.DB_HOST.split(':');

  logger.info(`create connection ${process.env.DB_HOST} ${process.env.DB_USER} ${process.env.DB_NAME}`)

  // Establish a connection to the database
  return await mysql.createPool({
    user: process.env.DB_USER, // e.g. 'my-db-user'
    password: process.env.DB_PASS, // e.g. 'my-db-password'
    database: process.env.DB_NAME, // e.g. 'my-database'
    host: dbSocketAddr[0], // e.g. '127.0.0.1'
    port: dbSocketAddr[1], // e.g. '3306'
    // ... Specify additional properties here.
    ...config,
  });
};
// [END cloud_sql_mysql_mysql_create_tcp]

// [START cloud_sql_mysql_mysql_create_socket]
const createUnixSocketPool = async config => {
  const dbSocketPath = process.env.DB_SOCKET_PATH || '/cloudsql';

  logger.info(`createUnixSocketPool ${process.env.DB_SOCKET_PATH}`)

  // Establish a connection to the database
  return await mysql.createPool({
    user: process.env.DB_USER, // e.g. 'my-db-user'
    password: process.env.DB_PASS, // e.g. 'my-db-password'
    database: process.env.DB_NAME, // e.g. 'my-database'
    // If connecting via unix domain socket, specify the path
    socketPath: `${dbSocketPath}/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
    // Specify additional properties here.
    ...config,
  });
};
// [END cloud_sql_mysql_mysql_create_socket]

const createPool = async () => {

  logger.info(`create pool !!!`)
  const config = {
    // [START cloud_sql_mysql_mysql_limit]
    // 'connectionLimit' is the maximum number of connections the pool is allowed
    // to keep at once.
    connectionLimit: 5,
    // [END cloud_sql_mysql_mysql_limit]

    // [START cloud_sql_mysql_mysql_timeout]
    // 'connectTimeout' is the maximum number of milliseconds before a timeout
    // occurs during the initial connection to the database.
    connectTimeout: 10000, // 10 seconds
    // 'acquireTimeout' is the maximum number of milliseconds to wait when
    // checking out a connection from the pool before a timeout error occurs.
    acquireTimeout: 10000, // 10 seconds
    // 'waitForConnections' determines the pool's action when no connections are
    // free. If true, the request will queued and a connection will be presented
    // when ready. If false, the pool will call back with an error.
    waitForConnections: true, // Default: true
    // 'queueLimit' is the maximum number of requests for connections the pool
    // will queue at once before returning an error. If 0, there is no limit.
    queueLimit: 0, // Default: 0
    // [END cloud_sql_mysql_mysql_timeout]

    // [START cloud_sql_mysql_mysql_backoff]
    // The mysql module automatically uses exponential delays between failed
    // connection attempts.
    // [END cloud_sql_mysql_mysql_backoff]
  };
  if (process.env.DB_HOST) {
    return await createTcpPool(config);
  } else {
    return await createUnixSocketPool(config);
  }
};

const ensureSchema = async pool => {
  // Wait for tables to be created (if they don't already exist).
  logger.info('create db table if needed')
  await pool.query(
      `CREATE TABLE IF NOT EXISTS votes
      ( vote_id SERIAL NOT NULL, time_cast timestamp NOT NULL,
      candidate CHAR(6) NOT NULL, PRIMARY KEY (vote_id) );`
  );
  console.log("Ensured that table 'votes' exists");
};

const createPoolAndEnsureSchema = async () =>
    await createPool()
        .then(async pool => {
          await ensureSchema(pool);
          return pool;
        })
        .catch(err => {
          logger.error(err);
          throw err;
        });

let pool;

app.use(async (req, res, next) => {
  if (pool) {
    return next();
  }
  try {
    pool = await createPoolAndEnsureSchema();
    next();
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});




app.get('/ping', (req, res) => {
  const name = process.env.NAME || 'World';
  res.send(`Hello ${name}!`);
});

app.get('/', async (req, res) => {
  pool = pool || (await createPoolAndEnsureSchema());
  try {
    // Get the 5 most recent votes.
    const recentVotesQuery = pool.query(
        'SELECT candidate, time_cast FROM votes ORDER BY time_cast DESC LIMIT 5'
    );

    // Get votes
    const stmt = 'SELECT COUNT(vote_id) as count FROM votes WHERE candidate=?';
    const tabsQuery = pool.query(stmt, ['TABS']);
    const spacesQuery = pool.query(stmt, ['SPACES']);

    // Run queries concurrently, and wait for them to complete
    // This is faster than await-ing each query object as it is created
    const recentVotes = await recentVotesQuery;
    const [tabsVotes] = await tabsQuery;
    const [spacesVotes] = await spacesQuery;

    const result = {
        recentVotes,
        tabCount: tabsVotes.count,
        spaceCount: spacesVotes.count,
    }

    res.send(`DB: ${JSON.stringify(result)}`)

    // res.render('index.pug', {
    //   recentVotes,
    //   tabCount: tabsVotes.count,
    //   spaceCount: spacesVotes.count,
    // });
  } catch (err) {
    logger.error(err);
    res
        .status(500)
        .send(
            'Unable to load page. Please check the application logs for more details.'
        )
        .end();
  }
});


const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`helloworld: listening on port ${port}`);
});
// [END run_helloworld_service]
// [END cloudrun_helloworld_service]

// Exports for testing purposes.
module.exports = app;
