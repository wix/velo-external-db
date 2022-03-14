

terraform {
  required_version = ">= 0.14"

  required_providers {
    google = ">= 3.8"
  }
}

provider "google" {
  project = var.project_id
}

resource "random_integer" "random_suffix" {
  min = 1
  max = 10000
}

resource "random_password" "user_db_password" {
  length  = 12
  special = true
}


resource "google_project_service" "run_api" {
  service            = "run.googleapis.com"
  disable_on_destroy = false
}
resource "google_project_service" "secretmanager" {
  service            = "secretmanager.googleapis.com"
  disable_on_destroy = false
}

# ------- Database setup ------- 

# change the name of the db
resource "google_sql_database_instance" "instance" {
  name             = "${var.db_name}-${random_integer.random_suffix.result}"
  region           = var.adapter_location
  database_version = "MYSQL_5_7"
  settings {
    tier = "db-f1-micro"
  }
  deletion_protection = false

}

resource "google_sql_user" "root_user" {
  project    = var.project_id
  name       = "root"
  instance   = google_sql_database_instance.instance.name
  password   = random_password.user_db_password.result
  depends_on = [google_sql_database_instance.instance]
}

resource "google_sql_database" "database" {
  name       = var.database_name
  project    = var.project_id
  instance   = google_sql_database_instance.instance.name
  depends_on = [google_sql_database_instance.instance]
}

# ------- Secret manger setup ------- 

resource "google_secret_manager_secret" "user_secret" {
  secret_id = "DB_USER-${random_integer.random_suffix.result}"

  replication {
    automatic = true
  }

  depends_on = [google_project_service.secretmanager]
}

resource "google_secret_manager_secret_version" "user_secret_version_data" {
  secret      = google_secret_manager_secret.user_secret.id
  secret_data = google_sql_user.root_user.name
  depends_on  = [google_secret_manager_secret.user_secret, google_sql_database_instance.instance, google_sql_user.root_user]
}

resource "google_secret_manager_secret" "password_secret" {
  secret_id = "DB_PASSWORD-${random_integer.random_suffix.result}"
  replication {
    automatic = true
  }

  depends_on = [google_project_service.secretmanager]
}

resource "google_secret_manager_secret_version" "password_secret_version_data" {
  secret      = google_secret_manager_secret.password_secret.id
  secret_data = random_password.user_db_password.result
  depends_on  = [google_secret_manager_secret.password_secret, google_sql_database_instance.instance, google_sql_user.root_user]
}

resource "google_secret_manager_secret" "secret_key_secret" {
  secret_id = "SECRET_KEY-${random_integer.random_suffix.result}"
  replication {
    automatic = true
  }

  depends_on = [google_project_service.secretmanager]
}

resource "google_secret_manager_secret_version" "secret_key_secret_version_data" {
  secret      = google_secret_manager_secret.secret_key_secret.id
  secret_data = var.secret_key
  depends_on  = [google_secret_manager_secret.secret_key_secret]
}

resource "google_secret_manager_secret" "db_secret" {
  secret_id = "DB-${random_integer.random_suffix.result}"
  replication {
    automatic = true
  }

  depends_on = [google_project_service.secretmanager]
}

resource "google_secret_manager_secret_version" "db_version_data" {
  secret      = google_secret_manager_secret.db_secret.id
  secret_data = google_sql_database.database.name
  depends_on  = [google_sql_database.database]
}

resource "google_secret_manager_secret" "connection_name_secret" {
  secret_id = "CLOUD_SQL_CONNECTION_NAME-${random_integer.random_suffix.result}"
  replication {
    automatic = true
  }

  depends_on = [google_project_service.secretmanager]
}

resource "google_secret_manager_secret_version" "connection_name_secret_version_data" {
  secret      = google_secret_manager_secret.connection_name_secret.id
  secret_data = google_sql_database_instance.instance.connection_name
  depends_on  = [google_sql_database_instance.instance]
}

# ------- Service account setup ------- 

resource "google_service_account" "sa-name" {
  account_id   = "velo-db-adapter-${random_integer.random_suffix.result}"
  display_name = "velo-db-adapter-${random_integer.random_suffix.result}"
}

resource "google_project_iam_member" "cloud_sql_admin_binding" {
  project    = var.project_id
  role       = "roles/cloudsql.admin"
  member     = "serviceAccount:${google_service_account.sa-name.email}"
  depends_on = [google_service_account.sa-name]
}

resource "google_project_iam_member" "secret_accessor_binding" {
  project    = var.project_id
  role       = "roles/secretmanager.secretAccessor"
  member     = "serviceAccount:${google_service_account.sa-name.email}"
  depends_on = [google_service_account.sa-name]
}

# ------- CloudRun setup ------- 

resource "google_cloud_run_service" "run_service" {
  name     = "${var.adapter_name}-${random_integer.random_suffix.result}"
  location = var.adapter_location

  template {
    spec {
      service_account_name = google_service_account.sa-name.email
      containers {
        image = var.image_url
        env {
          name  = "CLOUD_VENDOR"
          value = "gcp"
        }
        env {
          name  = "TYPE"
          value = "mysql"
        }
        env {
          name = "CLOUD_SQL_CONNECTION_NAME"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.connection_name_secret.secret_id
              key  = "latest"
            }
          }
        }
        env {
          name = "USER"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.user_secret.secret_id
              key  = "latest"
            }
          }
        }
        env {
          name = "PASSWORD"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.password_secret.secret_id
              key  = "latest"
            }
          }
        }
        env {
          name = "DB"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.db_secret.secret_id
              key  = "latest"
            }
          }
        }
        env {
          name = "SECRET_KEY"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.secret_key_secret.secret_id
              key  = "latest"
            }
          }
        }
      }
    }

    metadata {
      annotations = {
        "run.googleapis.com/cloudsql-instances" = google_sql_database_instance.instance.connection_name
        "run.googleapis.com/launch-stage"       = "BETA"
      }
    }

  }

  traffic {
    percent         = 100
    latest_revision = true
  }
  # Waits for the Cloud Run API to be enabled
  depends_on = [google_project_service.run_api, google_sql_database_instance.instance, google_service_account.sa-name,
   google_secret_manager_secret_version.user_secret_version_data, google_secret_manager_secret_version.secret_key_secret_version_data,google_secret_manager_secret_version.db_version_data,
   google_secret_manager_secret_version.db_version_data, google_secret_manager_secret_version.connection_name_secret_version_data]
}

resource "google_cloud_run_service_iam_member" "run_all_users" {
  service  = google_cloud_run_service.run_service.name
  location = google_cloud_run_service.run_service.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}



