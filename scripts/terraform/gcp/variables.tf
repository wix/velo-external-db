
variable "project_id" {
  description = "The project ID to deploy to"
  type        = string
}

variable "adapter_location" {
  description = "Velo External DB adapter service deployment location"
  type        = string
  default = "us-east4"
}

variable "db_location" {
  description = "Database location"
  type        = string
  default = "us-east4"
}

variable "adapter_name" {
  description = "The name of the Velo External DB adapter service to create"
  type        = string
  default     = "velo-external-db-adapter"
}

variable "image_url" {
  description = "GCR hosted image URL to deploy"
  type        = string
  default = "gcr.io/wix-velo-api/velo-external-db"
}

variable "secret_key" {
  description = "Secret Key for Velo External DB adapter service"
  type        = string
  default = "myKey"
  
}

variable "database_name" {
  description = "Database name for Velo External DB adapter service"
  type        = string
  default = "myDatabase"
}