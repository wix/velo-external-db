output "adapterUrl" {
  value       = azurerm_app_service.veloAppService.default_site_hostname
  description = "The URL on which the deployed service is available"
}
