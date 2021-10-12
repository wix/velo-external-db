[![CI](https://github.com/wix/velo-external-db/actions/workflows/main.yml/badge.svg)](https://github.com/wix/velo-external-db/actions/workflows/main.yml)

# Wix Velo External database connector

## Overview

When you [enable Velo](https://support.wix.com/en/article/enabling-velo) on your Wix site you also automatically get [Wix Data](https://support.wix.com/en/article/about-wix-data) APIs, which lets you work with Wix built-in databases on your site. But if you want to work with a data that you own and manage in an external database, Velo lets you connect your site to an external database and then work with that database collection in your site just as you would with our built-in collections.

That means that you can use wix-data APIs, display data from an external collection in Editor elements, use the data to create dynamic pages and connect it to user input elements.

This is Wix maintained reference implementation of the [wix-data SPI](https://www.wix.com/velo/reference/spis/external-database-collections) that allows developing external database connectors that are not oficially supported by Wix yet.

## Choosing right DB Engine for a site workload

In most cases where data collections don't exceed 10K records, built-in database is the best choise for building a web site. It has native support for PII encryption, GDPR and other non functional concerns. But if there are requirements for data locality, regulations or data workload specific concerns, this connector enables connecting external database engines to your site. There are lot of materials on the internet for a database comparisons, benchmarks, etc, but the rule of thumbs for working with data on a web site is saying the following:

* If the dataset is less of 10K records, don't bother, use built-in wix-data database
* If the dataset is between 10K to 1M records and it is being used for production workloads for user facing pages rendering, use relational databases like Postgres, MySQL, Microsoft SQL Server or Google Cloud Spanner.
* If the dataset exeeds 1M records and it is mainly used for reporting, think about Google BigQuery, Snowflake or other big data DB engine.

If neither case is applicable to your case, the choice for a DB engine powering the Wix site should be made according to specific requirements.

## Supported databases and limitations

* MySQL
* Postgres
* MongoDB
* Microsoft SQL Server
* Google Cloud Spanner
* Google Cloud Firestore
* Amazon Aurora
* Google Sheets and Bigsheets
* Airtable

## Supported Public clouds

Google Cloud
Deploying connector to Cloud Run
Deploying connector to AppEngine
Amazon Web Services
Deployng connector to App Runner
Microsoft Azure
Deploying connector to Azure App Services
Deployng connector to Azure Container service

## Working with on prem external database

## Read Only vs Read Write collections

## Datatypes mappings

## Developing or extending the Connector
