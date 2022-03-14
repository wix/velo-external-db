variable "region" {
  description = "Velo External DB adapter service deployment region"
  type        = string
  default     = "eastus"
}

variable "resourceGroupName" {
    description = "Velo External DB adapter service deployment resource group name"
    type        = string
    default     = "velo-external-db-adapter-rg"
}

variable "databaseName" {
  description = "Database name for Velo External DB adapter service (must be unique)"
  type        = string
}

variable "databaseUserName" {
  description = "Database user name for Velo External DB adapter service"
  type        = string
}

variable "databasePassword" {
  description = "Database password for Velo External DB adapter service"
  type        = string
  sensitive   = true
}

variable "adapterName" {
  description = "The name of the Velo External DB adapter service to create (must be unique)"
  type        = string
}

variable "secretKey" {
  description = "Secret Key for Velo External DB adapter service"
  type        = string
  sensitive = true
}