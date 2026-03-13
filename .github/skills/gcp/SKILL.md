# Developer Skill: GCP (Google Cloud Platform) Deployments & Provisioning

This skill provides patterns, workflows, and `gcloud` CLI commands needed to initialize a GCP project from zero, deploy fastmvp backend services (`apps/api`), provision databases (Cloud SQL), and configure buckets (Cloud Storage) with correct IAM permissions.

## Prerequisites
Install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) and authenticate:
```bash
gcloud auth login
gcloud auth application-default login
```

## Project Initialization
Create a new project and set it as the active configuration:
```bash
export PROJECT_ID="fastmvp-backend-$(date +%s)"
export REGION="us-central1"

gcloud projects create $PROJECT_ID
gcloud config set project $PROJECT_ID
gcloud services enable run.googleapis.com sqladmin.googleapis.com storage.googleapis.com artifactregistry.googleapis.com
```

## Database Provisioning (Cloud SQL for PostgreSQL)
Creates a database instance for the `apps/api` backend:
```bash
# Create the PostgreSQL instance
gcloud sql instances create fastmvp-db-instance \
    --database-version=POSTGRES_15 \
    --cpu=1 --memory=4GB \
    --region=$REGION \
    --root-password="YourSecurePasswordHere!"

# Create the specific app database inside the instance
gcloud sql databases create fastmvp_db --instance=fastmvp-db-instance
```

## Storage Buckets (Cloud Storage)
Useful for storing user uploads, assets, or static ML models:

1. **Create a Bucket**:
```bash
gcloud storage buckets create gs://$PROJECT_ID-assets \
    --location=$REGION \
    --uniform-bucket-level-access
```

2. **Grant Public Read Access** (e.g., for public images):
```bash
gcloud storage buckets add-iam-policy-binding gs://$PROJECT_ID-assets \
    --member="allUsers" \
    --role="roles/storage.objectViewer"
```

3. **CORS Configuration** (if direct frontend uploads are needed):
Create a `cors.json` file:
```json
[
  {
    "origin": ["*"],
    "method": ["GET", "PUT", "POST", "OPTIONS"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```
Apply the configuration:
```bash
gcloud storage buckets update gs://$PROJECT_ID-assets --cors-file=cors.json
```

## Deploying Backends (Cloud Run)
For deploying `apps/api` (TypeScript/Fastify) or `apps/api-<name>` (Python/Flask) as serverless containers.

1. **Build and push the Docker image to Artifact Registry**:
```bash
# Create AR repository
gcloud artifacts repositories create fastmvp-repo \
    --repository-format=docker \
    --location=$REGION

# Build using Cloud Build (from root directory, specify backend folder)
gcloud builds submit --tag $REGION-docker.pkg.dev/$PROJECT_ID/fastmvp-repo/api:latest ./apps/api
```

2. **Deploy to Cloud Run**:
```bash
gcloud run deploy fastmvp-api \
    --image $REGION-docker.pkg.dev/$PROJECT_ID/fastmvp-repo/api:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars="NODE_ENV=production,DB_HOST=...,DB_USER=...,DB_PASS=..."
```

## Service Accounts & Least Privilege
If your Cloud Run service needs specific access (like reading from buckets securely without making them public):
```bash
# Create Service Account
gcloud iam service-accounts create fastmvp-api-sa \
    --display-name="FastMVP API Service Account"

# Grant Storage Object Admin to SA
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:fastmvp-api-sa@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.objectAdmin"

# Deploy Cloud Run using the new SA
gcloud run deploy fastmvp-api --service-account=fastmvp-api-sa@$PROJECT_ID.iam.gserviceaccount.com ...
```
