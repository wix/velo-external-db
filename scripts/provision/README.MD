# Wix Velo External Database Adapter Generator

<!-- TOC -->
- [Wix Velo External Database Adapter Generator](#wix-velo-external-database-adapter-generator)
  - [Introduction](#introduction)
  - [Prerequisites](#prerequisites)
    - [Google Cloud Platform](#google-cloud-platform)
    - [Azure](#azure)
<!-- TOC -->

## Introduction

Wix Velo External Database Adapter Generator was created to autogenerate Velo External Database Adapter for a variety of cloud services

## Prerequisites

### Google Cloud Platform 
To get started, you'll need:
1. An active gcp client email, and private key
2. Enable the following apis:
   1. Identity and Access Management (IAM) API
   2. Cloud Resource Manager API

### Azure
To get started, you'll need:
1. install azure cli
2. type 'az login' and log in your azure user.
3. get your user object id by the command ' az ad signed-in-user show | grep "objectId" ' and copy the value
4. get the subscription id by the command ' az account show | grep "id" ' and copy the value
