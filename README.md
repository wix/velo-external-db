[![CI](https://github.com/wix/velo-external-db/actions/workflows/main.yml/badge.svg)](https://github.com/wix/velo-external-db/actions/workflows/main.yml)

# Wix Velo External Database Adaptor

## Overview
  
Velo by Wix is a development platform built on top of Wix, adding a built-in database and node.js backend. The built-in database is a document based database optimized for websites and content. Depending on the specific workload, it can support 10K - 100K records, and for some workloads even more. It is globally replicated, has native support for PII encryption, GDPR, and other non-functional features. It runs on shared infrastructure and is fully managed by Wix. 

However, requirements for data locality, regulations, data ownership, dedicated infrastructure, or workloads that demand specific engines may require an external database. This adaptor enables connecting external database engines to your site.

Velo lets you connect an “external database” and map the structures of the underlying tables as wix-data collections. Once connected, you can work with the database and it’s collections in your site just as you would with the built-in database.

You can use wix-data APIs, display data from an external database collection in Wix Editor elements, use the data to create dynamic pages, and connect it to user input elements.

This project is a reference implementation of the [wix-data SPI](https://www.wix.com/velo/reference/spis/external-database-collections), allowing the development or extension of alternative external database adaptors, to connect Velo with external databases.

For a detailed guide to installing and integrating this adaptor on Google Cloud Platform, see the [Integrate Your Google Cloud MySQL or Postgres Database with Your Velo Site](https://support.wix.com/en/article/integrate-your-google-cloud-mysql-or-postgres-database-with-your-velo-site) article. If you are deploying to AWS, please follow the [Integrate Your AWS RDS Database with Your Velo Site](https://support.wix.com/en/article/integrate-your-aws-mysql-database-with-your-velo-site) tutorial.

## Architecture

The external database adaptor is a Node.js server that implements the [wix-data SPI](https://www.wix.com/velo/reference/spis/external-database-collections). The server communicates with the database using the database's native protocol. It then translates the data into wix-data format and communicates with the Wix site via the wix-data SPI. 
![Architecture diagram](https://d2x3xhvgiqkx42.cloudfront.net/12345678-1234-1234-1234-1234567890ab/11e10e4f-b84d-4136-a5a9-6109fab0b7d7/2021/02/28/2ea08bbb-fd80-4867-a96e-f1e6ace75200/3a60c87f-2a76-4070-8cd2-88061df85565.png)

The Wix-Data SPI is a REST over HTTPS protocol in which the Wix site forwards database operations to the adaptor (1), which translates them to native DB operations (2). The adaptor calls the external database (3), gets the response (4), translates the response back to the wix-data protocol (5), and responds to the SPI request (6).
  

### Deployment Considerations

Wix maintains a pre-built Docker container image that is ready to be deployed. Your should run the container as close as possible to a database to minimize the latency of the native DB protocol traffic between the adaptor and the database. Additionally, some databases require persistent connections and are not suited to HTTP. Security and firewall configurations between the adaptor and database should also be considered. 

It is important to note the location of the deployed environment. The Wix infrastructure has a global presence, and site data is replicated worldwide to give your site visitors the best performance. Where the database is managed externally, it is important to set up the adaptor and the database in the correct region for optimal performance.

## Supported Databases and Limitations

The following lists the databases supported by the adaptor:

* [MySQL](https://www.mysql.com)  
  Supported vanilla MySQL versions: 5.7 to 8.0.  
  While MySQL variants like MariaDB and Percona Server for MySQL have not been tested, they claim to be fully compatible with MySQL and therefore are assumed to work. The following managed versions of MySQL work with the adaptor:
  * [Google Cloud SQL for MySQL](https://cloud.google.com/sql)
  * [Amazon RDS for MySQL and MariaDB](https://aws.amazon.com/rds/mysql/)
  * [Amazon Aurora](https://aws.amazon.com/rds/aurora/mysql-features/)
  * [Microsoft Azure MySQL](https://azure.microsoft.com/en-us/services/mysql/#overview)
* [Postgres](https://www.postgresql.org)  
  Supported versions 12, 13.  
  Managed versions available:
  * [Google Cloud SQL for Postgres](https://cloud.google.com/sql)
  * [Amazon RDS for PostgreSQL](https://aws.amazon.com/rds/postgresql/)
  * [Amazon Aurora](https://aws.amazon.com/rds/aurora)
  * [Microsoft Azure Postgres](https://azure.microsoft.com/en-us/services/postgresql)


## Public Cloud Platforms

The adaptor is a Docker container image, It is supported by any cloud environment that supports Docker containers.
This includes:
* Google Cloud
  * [Deploying to Cloud Run](https://support.wix.com/en/article/using-your-mysql-and-postgres-database-with-velo)
  * Deploying to AppEngine
* Amazon Web Services
  * [Deploying to App Runner](https://support.wix.com/en/article/integrate-your-aws-mysql-database-with-your-velo-site)
* Microsoft Azure
  * Deploying to Azure App Services
  * Deploying to Azure Container service
