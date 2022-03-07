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


resource "azurerm_mysql_server" "mySqlServer" {
  depends_on = [azurerm_resource_group.resourceGroup]

  name                         = var.databaseName
  location                     = azurerm_resource_group.resourceGroup.location
  resource_group_name          = azurerm_resource_group.resourceGroup.name
  sku_name                     = "GP_Gen5_2"
  version                      = "5.7"
  ssl_enforcement              = "Disabled"
  storage_mb                   = 51200
  administrator_login          = var.databaseUserName
  administrator_login_password = var.databasePassword
}

resource "azurerm_mysql_database" "velo_db" {
  name                = "velo_db"
  resource_group_name = azurerm_resource_group.resourceGroup.name
  server_name         = azurerm_mysql_server.mySqlServer.name
  charset             = "utf8"
  collation           = "utf8_unicode_ci"
}




resource "azurerm_key_vault" "veloKeyVault" {
    depends_on = [azurerm_resource_group.resourceGroup]

    name                = "veloKeyVault55"
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
  value        = azurerm_mysql_server.mySqlServer.fqdn
  key_vault_id = azurerm_key_vault.veloKeyVault.id
}

resource "azurerm_key_vault_secret" "user" {
  depends_on   = [azurerm_key_vault.veloKeyVault, azurerm_mysql_server.mySqlServer]

  name         = "USER"
  value        = "${azurerm_mysql_server.mySqlServer.administrator_login}@${azurerm_mysql_server.mySqlServer.name}"
  key_vault_id = azurerm_key_vault.veloKeyVault.id
}

resource "azurerm_key_vault_secret" "password" {
  depends_on = [azurerm_key_vault.veloKeyVault]

  name         = "PASSWORD"
  value        = azurerm_mysql_server.mySqlServer.administrator_login_password
  key_vault_id = azurerm_key_vault.veloKeyVault.id
}

resource "azurerm_key_vault_secret" "db" {
  depends_on = [azurerm_key_vault.veloKeyVault]

  name         = "DB"
  value        = azurerm_mysql_database.velo_db.name
  key_vault_id = azurerm_key_vault.veloKeyVault.id
}

resource "azurerm_key_vault_secret" "secretKey" {
  depends_on = [azurerm_key_vault.veloKeyVault]

  name         = "SECRETKEY"
  value        = var.secretKey
  key_vault_id = azurerm_key_vault.veloKeyVault.id
}

resource "azurerm_mysql_virtual_network_rule" "myRule" {
    depends_on = [azurerm_mysql_server.mySqlServer, azurerm_subnet.veloSubnet]

    name                = "myRule"
    resource_group_name = azurerm_resource_group.resourceGroup.name
    server_name         = azurerm_mysql_server.mySqlServer.name
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
    depends_on = [azurerm_resource_group.resourceGroup, azurerm_app_service_plan.veloAppServicePlan]

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
        TYPE         = "mysql"
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
