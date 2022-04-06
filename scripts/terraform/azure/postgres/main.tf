terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=2.97.0"
    }
  }
}

provider "azurerm" {
    features {}
}

data "azurerm_client_config" "current" {}

resource "random_id" "random" {
    byte_length = 5
}

resource "azurerm_resource_group" "resourceGroup" {
  name     = var.resourceGroupName
  location = var.region
}


resource "azurerm_virtual_network" "veloVirtualNetwork" {
    depends_on = [azurerm_resource_group.resourceGroup]

    name = "veloVirtualNetwork"
    location            = azurerm_resource_group.resourceGroup.location
    resource_group_name = azurerm_resource_group.resourceGroup.name
    address_space       = ["10.0.0.0/16"]
    
}

resource "azurerm_subnet" "veloSubnet" {
  depends_on = [azurerm_virtual_network.veloVirtualNetwork]

  name                 = "veloSubnet"
  resource_group_name  = azurerm_resource_group.resourceGroup.name
  virtual_network_name = azurerm_virtual_network.veloVirtualNetwork.name
  address_prefixes     = ["10.0.1.0/24"]
  service_endpoints    = ["Microsoft.Sql", "Microsoft.KeyVault"]
  
  delegation {
    name = "Microsoft.Web/serverFarms"
    service_delegation {
      name    = "Microsoft.Web/serverFarms"
      actions = ["Microsoft.Network/virtualNetworks/subnets/action"]
    }  
  }
}

resource "azurerm_postgresql_server" "postgresServer" {
  name                         = var.databaseName
  location                     = azurerm_resource_group.resourceGroup.location
  resource_group_name          = azurerm_resource_group.resourceGroup.name
  sku_name                     = "GP_Gen5_2"
  version                      = "11"
  ssl_enforcement_enabled      = false
  storage_mb                   = 51200
  administrator_login          = var.databaseUserName
  administrator_login_password = var.databasePassword 
}

resource "azurerm_postgresql_database" "velo_db" {
  depends_on = [azurerm_postgresql_server.postgresServer]

  name                = "velodb"
  resource_group_name = azurerm_resource_group.resourceGroup.name
  server_name         = azurerm_postgresql_server.postgresServer.name
  charset             = "UTF8"
  collation           = "English_United States.1252"
}

resource "azurerm_key_vault" "veloKeyVault" {
    depends_on = [azurerm_resource_group.resourceGroup]

    name                = "veloKeyVault-${random_id.random.id}"
    location            = azurerm_resource_group.resourceGroup.location
    resource_group_name = azurerm_resource_group.resourceGroup.name
    tenant_id           = data.azurerm_client_config.current.tenant_id
    sku_name            = "standard"
    soft_delete_enabled = true

    access_policy {
        tenant_id          = data.azurerm_client_config.current.tenant_id
        object_id          = data.azurerm_client_config.current.object_id
        secret_permissions = [
            "get",
            "list",
            "set",
            "delete",
            "restore",
            "backup",
            "recover",
            "purge"
        ]
    }   
}


resource "azurerm_key_vault_secret" "host" {
  depends_on = [azurerm_key_vault.veloKeyVault]

  name         = "HOST"
  value        = azurerm_postgresql_server.postgresServer.fqdn
  key_vault_id = azurerm_key_vault.veloKeyVault.id
}

resource "azurerm_key_vault_secret" "user" {
  depends_on   = [azurerm_key_vault.veloKeyVault, azurerm_postgresql_server.postgresServer]

  name         = "USER"
  value        = "${azurerm_postgresql_server.postgresServer.administrator_login}@${azurerm_postgresql_server.postgresServer.name}"
  key_vault_id = azurerm_key_vault.veloKeyVault.id
}

resource "azurerm_key_vault_secret" "password" {
  depends_on = [azurerm_key_vault.veloKeyVault]

  name         = "PASSWORD"
  value        = azurerm_postgresql_server.postgresServer.administrator_login_password
  key_vault_id = azurerm_key_vault.veloKeyVault.id
}

resource "azurerm_key_vault_secret" "db" {
  depends_on = [azurerm_key_vault.veloKeyVault]

  name         = "DB"
  value        = azurerm_postgresql_database.velo_db.name
  key_vault_id = azurerm_key_vault.veloKeyVault.id
}

resource "azurerm_key_vault_secret" "secretKey" {
  depends_on = [azurerm_key_vault.veloKeyVault]

  name         = "SECRETKEY"
  value        = var.secretKey
  key_vault_id = azurerm_key_vault.veloKeyVault.id
}

resource "azurerm_postgresql_virtual_network_rule" "myRule" {
    depends_on = [azurerm_postgresql_server.postgresServer, azurerm_subnet.veloSubnet]

    name                = "myRule"
    resource_group_name = azurerm_resource_group.resourceGroup.name
    server_name         = azurerm_postgresql_server.postgresServer.name
    subnet_id           = azurerm_subnet.veloSubnet.id
}

resource "azurerm_app_service_plan" "veloAppServicePlan" {
    depends_on = [azurerm_resource_group.resourceGroup]

    name                = "veloAppServicePlan"
    location            = azurerm_resource_group.resourceGroup.location
    resource_group_name = azurerm_resource_group.resourceGroup.name
    kind                = "Linux"
    reserved            = true

    sku {
        tier = "PremiumV2"
        size = "P1V2"
        capacity = "1"
    }
}

resource "azurerm_app_service" "veloAppService" {
    depends_on = [azurerm_resource_group.resourceGroup, azurerm_app_service_plan.veloAppServicePlan, azurerm_key_vault.veloKeyVault]

    name                = var.adapterName
    location            = azurerm_resource_group.resourceGroup.location
    resource_group_name = azurerm_resource_group.resourceGroup.name
    app_service_plan_id = azurerm_app_service_plan.veloAppServicePlan.id
    site_config {
        linux_fx_version = "DOCKER|veloex/velo-external-db:latest"
    }

    identity {
        type = "SystemAssigned"
    }

    app_settings = {
        CLOUD_VENDOR = "azure"
        TYPE         = "postgres"
        HOST         = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.veloKeyVault.name};SecretName=${azurerm_key_vault_secret.host.name})"
        USER         = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.veloKeyVault.name};SecretName=${azurerm_key_vault_secret.user.name})"
        PASSWORD     = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.veloKeyVault.name};SecretName=${azurerm_key_vault_secret.password.name})"
        DB           = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.veloKeyVault.name};SecretName=${azurerm_key_vault_secret.db.name})"
        SECRET_KEY   = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.veloKeyVault.name};SecretName=${azurerm_key_vault_secret.secretKey.name})"
    }
}

resource "azurerm_app_service_virtual_network_swift_connection" "appServiceToVNet" {
    depends_on     = [azurerm_app_service.veloAppService]

    app_service_id = azurerm_app_service.veloAppService.id
    subnet_id      = azurerm_subnet.veloSubnet.id
}


resource "azurerm_key_vault_access_policy" "veloKeyVaultPolicy" {
    depends_on         = [azurerm_key_vault.veloKeyVault, azurerm_app_service.veloAppService]

    key_vault_id       = azurerm_key_vault.veloKeyVault.id
    tenant_id          = azurerm_app_service.veloAppService.identity.0.tenant_id
    object_id          = azurerm_app_service.veloAppService.identity.0.principal_id
    secret_permissions = ["get"]
}
