

terraform {
  required_version = ">= 0.14"

  required_providers {
    google = ">= 3.3"
  }
}

provider "google" {
  project = var.project_id
}

resource "google_project_service" "run_api" {
  service = "run.googleapis.com"
  disable_on_destroy = false
}

# ------- Database setup ------- 

# change the name of the db
resource "google_sql_database_instance" "instance" {
  name             = "cloudrun-sql"
  region           = var.adapter_location
  database_version = "MYSQL_5_7"
  settings {
    tier = "db-f1-micro"
  }
  deletion_protection=false

}

resource "google_sql_user" "root_user" {
  name     = "root"
  instance = google_sql_database_instance.instance.name
  password = "myPassword"
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
  secret_id = "secret"
  replication {
    automatic = true
  } 
}

resource "google_secret_manager_secret_version" "user_secret_version_data" {
  secret = google_secret_manager_secret.user_secret.name
  secret_data = google_sql_user.root_user.name
  depends_on = [google_secret_manager_secret.user_secret ,google_sql_database_instance.instance]
}

resource "google_secret_manager_secret" "password_secret" {
  secret_id = "password_secret"
  replication {
    automatic = true
  } 
}

resource "google_secret_manager_secret_version" "password_secret_version_data" {
  secret = google_secret_manager_secret.user_secret.name
  secret_data = google_sql_user.root_user.password
  depends_on = [google_secret_manager_secret.password_secret ,google_sql_database_instance.instance]
}


# ------- Service account setup ------- 

resource "google_service_account" "sa-name" {
  account_id = "sa-name"
  display_name = "SA"
}

resource "google_project_iam_member" "firestore_owner_binding" {
  project = var.project_id
  role    = "roles/cloudsql.admin"
  member  = "serviceAccount:${google_service_account.sa-name.email}"
  depends_on = [google_service_account.sa-name]
}

resource "google_project_iam_member" "firestore_owner_binding2" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.sa-name.email}"
  depends_on = [google_service_account.sa-name]
}

# ------- CloudRun setup ------- 

resource "google_cloud_run_service" "run_service" {
  name = var.adapter_name
  location = var.adapter_location

  template {
    spec {
        service_account_name  = google_service_account.sa-name.email
      containers {
        image = var.image_url
        env {
          name = "CLOUD_VENDOR"
          value = "gcp"
        }
        env {
          name = "TYPE"
          value = "mysql"
        }
        env {
          name = "CLOUD_SQL_CONNECTION_NAME"
          value = google_sql_database_instance.instance.connection_name
        }
        env {
          name = "USER"
          value_from {
              secret_key_ref {
                name = google_secret_manager_secret.user_secret.secret_id
                key = "latest"
              }
          }
        }
        env {
          name = "PASSWORD"
          value = google_sql_user.root_user.password
        }
        env {
          name = "DB"
          value = google_sql_database.database.name
        }
        env {
          name = "SECRET_KEY"
          value = var.secret_key
        }
      }
    }

    metadata {
      annotations = {
        "run.googleapis.com/cloudsql-instances" = google_sql_database_instance.instance.connection_name
         "run.googleapis.com/launch-stage" = "BETA"
      }
  }
  
  }

  traffic {
    percent         = 100
    latest_revision = true
  }


  # Waits for the Cloud Run API to be enabled
  depends_on = [google_project_service.run_api, google_sql_database_instance.instance, google_service_account.sa-name, google_secret_manager_secret.user_secret]
}

resource "google_cloud_run_service_iam_member" "run_all_users" {
  service  = google_cloud_run_service.run_service.name
  location = google_cloud_run_service.run_service.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}



