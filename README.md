[![CI](https://github.com/wix/velo-external-db/actions/workflows/main.yml/badge.svg)](https://github.com/wix/velo-external-db/actions/workflows/main.yml)

# Wix Velo External Database Connector

## Overview

When you [enable Velo](https://support.wix.com/en/article/enabling-velo) on your Wix site you also automatically get [Wix Data](https://support.wix.com/en/article/about-wix-data) APIs, which lets you work with Wix built-in databases on your site. If you want to work with a data that you own and manage in an external database, Velo lets you connect your site to an external database and then work with that database collection in your site just as you would with our built-in collections.

You can use wix-data APIs, display data from an external collection in Editor elements, use the data to create dynamic pages, and connect it to user input elements.

See the [external database collections SPI](https://www.wix.com/velo/reference/spis/external-database-collections) reference that specifies how to develop external database connectors for databases that aren't supported yet by Wix.

## Architecture

The external database collections adapter is a Node.js server that implements the  [external database collections SPI](https://www.wix.com/velo/reference/spis/external-database-collections). The server communicates with the database using the database's native protocol. It then translates the data into a Wix format and communicates with the Wix site using REST over HTTPS.
![Architecture diagram](https://d2x3xhvgiqkx42.cloudfront.net/12345678-1234-1234-1234-1234567890ab/11e10e4f-b84d-4136-a5a9-6109fab0b7d7/2021/02/28/2ea08bbb-fd80-4867-a96e-f1e6ace75200/3a60c87f-2a76-4070-8cd2-88061df85565.png)

### Deployment Considerations

Wix maintains a pre-built Docker container image that is ready to be deployed. It's advisable to run the container as close as possible to a database to minimize the latency of the native DB protocol traffic between the adapter and the database. Security and firewall configurations between the adapter and database should also be considered. 

It is important to note the location of the deployed environment. The Wix infrastructure has a global presence, and site data is replicated worldwide to give your site visitors get the best performance. Where the database is managed externally, it's important to set up the connector and database in the correct region for optimal performance. Please refer to AWS, GCP, and Azure installation tutorials for regions recommendations.

## How to Choose the Right DB Engine for Your Site's Workload

In most cases where data collections don't exceed 10K records, the Wix Content Manager is the best choice for building a web site with data. Content Manager is globally replicated, has native support for PII encryption, GDPR, and other non-functional features. 

The external database collection adapter helps address the foolling issues:
+ Requirements for data to be hosted locality
+ Regulatory requirements
+ Processing workload 
+ Data volumes

Database size: 
* The Wix Content Manager should be used for data volumes of less than 10K records
* Relational databases like Postgres, MySQL, Microsoft SQL Server, or Google Cloud Spanner should be used if the dataset is between 10K to 1M records, it's being used for production workloads or for user-facing pages rendering. 
* Where the dataset exceeds 1M records and is primarily used for reporting, Google BigQuery, Snowflake or other big data DB engines should be considered.

## Supported Databases and Limitations

The following lists the databases supported by the adapter:

* [MySQL](https://www.mysql.com)
  Supported vanilla MySQL versions 5.7 to 8.0. While MySQL variants like MariaDB and Percona Server for MySQL have not been tested, they claim are fully compatible with MySQL and therefore are assumed to work. The following managed versions of MySQL work with the connector:
  * [Google Cloud SQL for MySQL](https://cloud.google.com/sql)
  * [Amazon RDS for MySQL and MariaDB](https://aws.amazon.com/rds/mysql/)
  * [Amazon Aurora](https://aws.amazon.com/rds/aurora/mysql-features/)
  * [Microsoft Azure MySQL](https://azure.microsoft.com/en-us/services/mysql/#overview)
* [Postgres](https://www.postgresql.org)
  Supported versions 12, 13. Managed versions available:
  * [Google Cloud SQL for Postgres](https://cloud.google.com/sql)
  * [Amazon RDS for PostgreSQL](https://aws.amazon.com/rds/postgresql/)
  * [Amazon Aurora](https://aws.amazon.com/rds/aurora)
  * [Microsoft Azure Postgres](https://azure.microsoft.com/en-us/services/postgresql)

The following databases have support planned for the near future: 
* [MongoDB](https://www.mongodb.com/)
  MongoDB can be self managed open source edition instance, or use managed [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). Atlas can be hosted on Google Cloud, Amazon AWS and Microsoft Azure. There are also great MongoDB API compaitable databases like [Amazon DocumentDB](https://aws.amazon.com/documentdb/) and [Microsoft Azure Cosmos DB](https://docs.microsoft.com/en-us/azure/cosmos-db/mongodb/mongodb-introduction).
* [Microsoft SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-2019)
  MS SQL server can be connected both as on-prem, self managed installation or managed version available as part of [Google Cloud SQL](https://cloud.google.com/sql/docs/sqlserver/quickstart) as well as [Amazon RDS for SQL Server](https://aws.amazon.com/rds/sqlserver/) or Microsoft Azure [fully managed service](https://azure.microsoft.com/en-us/products/azure-sql/database/#overview). 
* [Google Cloud Spanner](https://cloud.google.com/spanner) - Fully managed relational database with unlimited scale, strong consistency, and up to 99.999% availability from Google.
* [Google Cloud Firestore](https://cloud.google.com/firestore) - Fully managed, scalable, and serverless document database by Google Firebase.


## Supported Public Clouds

As the adpter is a docker container image, it is supported on any cloud environment that supports docker containers.
This includes:
* Google Cloud
  * [Deploying to Cloud Run](https://support.wix.com/en/article/using-your-mysql-and-postgres-database-with-velo)
  * Deploying to AppEngine
* Amazon Web Services
  * Deployng to App Runner
* Microsoft Azure
  * Deploying to Azure App Services
  * Deployng to Azure Container service
