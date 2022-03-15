# Wix Velo External Database Adapter Terraform provision

<!-- TOC -->
- [Wix Velo External Database Adapter Terraform provision](#wix-velo-external-database-adapter-terraform-provision)
  - [Introduction](#introduction)
  - [Prerequisites](#prerequisites)
    - [Azure](#azure)
    - [GCP](#gcp)
<!-- TOC -->

## Introduction

Using Terraform to provision the adapter in Azure/ GCP / AWS.

## Prerequisites

* You must have [Terraform](https://www.terraform.io/) installed on your computer.


### Azure
To get started, you'll need:
1. install azure cli
2. type 'az login' and log in your azure user.
3. install Terraform cli (https://learn.hashicorp.com/tutorials/terraform/install-cli)
4. run npm start:azure 

### GCP
To get started, you'll need:
1. install [gcloud CLI](https://cloud.google.com/sdk/docs/install)
2. Authenticate with GCP, The easiest way to do this is to run ``` gcloud auth application-default login. ```
3. Run ``` npm start:gcp ```

