#!/bin/bash
#
# Workload Identity Federation Setup for GitHub Actions → Cloud Run
#
# This script configures keyless authentication from GitHub Actions to GCP,
# allowing CI/CD deployments without managing service account keys.
#
# Prerequisites:
# - gcloud CLI installed and authenticated
# - Owner/Editor permissions on the GCP project
# - GitHub repository created
#
# Usage:
#   1. Edit the variables below (PROJECT_ID, REPO_OWNER, REPO_NAME)
#   2. Run: chmod +x scripts/setup-workload-identity.sh
#   3. Run: ./scripts/setup-workload-identity.sh
#
# The script will output the workload_identity_provider and service_account
# values to add to your GitHub Actions workflow.
#
set -e

# === CONFIGURATION - EDIT THESE VALUES ===
PROJECT_ID="aaiiintt"
SA_NAME="github-actions"
REPO_OWNER="aaiiintt"
REPO_NAME="josie-gameboy-portfolio"
# === END CONFIGURATION ===

# Get project number (required for workload identity provider path)
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")

echo "🔧 Setting up Workload Identity Federation for GitHub Actions"
echo "Project: $PROJECT_ID ($PROJECT_NUMBER)"
echo "Repository: $REPO_OWNER/$REPO_NAME"
echo ""

# Create Workload Identity Pool
echo "📦 Creating Workload Identity Pool..."
gcloud iam workload-identity-pools create "github" \
  --location="global" \
  --project="$PROJECT_ID" \
  --display-name="GitHub Actions Pool" || echo "Pool already exists"

# Create OIDC Provider
echo "🔑 Creating OIDC Provider..."
gcloud iam workload-identity-pools providers create-oidc "github" \
  --location="global" \
  --workload-identity-pool="github" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --attribute-condition="assertion.repository_owner == '$REPO_OWNER'" \
  --project="$PROJECT_ID" || echo "Provider already exists"

# Create Service Account
echo "👤 Creating Service Account..."
gcloud iam service-accounts create "$SA_NAME" \
  --display-name="GitHub Actions Service Account" \
  --project="$PROJECT_ID" || echo "Service account already exists"

# Grant permissions
echo "🔑 Granting Cloud Run permissions..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin" \
  --condition=None

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser" \
  --condition=None

echo "🔑 Granting Storage Admin permissions..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin" \
  --condition=None

echo "🔑 Granting Artifact Registry Admin permissions..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.repoAdmin" \
  --condition=None

echo "🔑 Granting Cloud Build Editor permissions..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.editor" \
  --condition=None

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.builder" \
  --condition=None

echo "🔑 Granting Service Usage Consumer permissions..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/serviceusage.serviceUsageConsumer" \
  --condition=None

echo "🔑 Granting Service Account Token Creator permissions..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountTokenCreator" \
  --condition=None

# Bind GitHub repo to service account
echo "🔗 Binding GitHub repository to service account..."
gcloud iam service-accounts add-iam-policy-binding "$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github/attribute.repository/$REPO_OWNER/$REPO_NAME" \
  --project="$PROJECT_ID"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Add these to your GitHub Actions workflow:"
echo "  workload_identity_provider: 'projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github/providers/github'"
echo "  service_account: '$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com'"
