# Wix Velo External Database Adaptor Terraform provision

<!-- TOC -->
- [Wix Velo External Database Adaptor Terraform provision](#wix-velo-external-database-adaptor-terraform-provision)
  - [Introduction](#introduction)
  - [Prerequisites](#prerequisites)
    - [Azure](#azure)
    - [GCP](#gcp)
<!-- TOC -->

## Introduction

Using Terraform to provision the adaptor in Azure/ GCP / AWS.

## Prerequisites

* You must have [Terraform](https://www.terraform.io/) installed on your computer.


### Azure
To get started, you'll need:
1. Install [azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
2. Authenticate with Azure: Run ``` az login ``` and log in your azure user.

**MySql**
- Run ``` npm run start:azure-mysql ``` 

**Postgres**
- Run ``` npm run start:azure-postgres ``` 

### GCP
To get started, you'll need:
1. Install [gcloud CLI](https://cloud.google.com/sdk/docs/install)
2. Authenticate with GCP, The easiest way to do this is to run ``` gcloud auth application-default login. ```
3. Run ``` npm start:gcp ```

