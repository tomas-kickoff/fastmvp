# Developer Skill: Vercel Deployments & Provisioning

This skill provides comprehensive patterns, workflows, and CLI commands for initializing, configuring, and deploying the \`fastmvp\` Next.js web application (\`apps/web\`) and integrated services like Vercel Postgres from scratch using the Vercel CLI.

## 1. Prerequisites & Authentication
Ensure the Vercel CLI is installed and authenticated:
```bash
npm i -g vercel
vercel login       # Log in to your Vercel account
vercel whoami      # Display your currently logged-in user or team
vercel switch      # Switch between teams/personal accounts
```

## 2. Project Setup & Linking
Navigate to the web app directory to manage your Vercel project:
```bash
cd apps/web

vercel link        # Link the local project to a Vercel project (creates .vercel directory)
vercel project add fastmvp-web  # Explicitly add a new project to your team
vercel project ls  # List all projects in your account/team
vercel init        # Initialize an example project (seldom needed since fastmvp scaffolds this)
```

## 3. Deployments
Managing code pushes to Vercel preview or production environments:
```bash
vercel deploy          # Deploy to a preview environment (fast iteration)
vercel deploy --prod   # Deploy directly to the production environment
vercel build           # Compile your project locally (simulates Vercel build step)
vercel rm fastmvp-web  # Remove a deployment or an entire project
vercel inspect <url>   # Get detailed metadata about a specific deployment
```

## 4. Local Development
Running the local server mirroring the remote Vercel environment:
```bash
vercel dev         # Run a local development server mirroring Vercel's environment
vercel pull        # Pull the latest Project Settings & Env Vars (writes to .vercel/.env.*.local)
```

## 5. Storage / Database Provisioning (Vercel Postgres / KV / Edge Config)
Provisioning Vercel's integrated storage solutions (useful for `apps/api` configuration):
```bash
# Adding storage to the linked project
vercel storage add postgres   # Initialize Vercel Postgres database integration
vercel storage add kv         # Initialize a Vercel KV (Redis) store
vercel storage add blob       # Initialize a Vercel Blob store
vercel storage add edgeConfig # Initialize an Edge Config

# Managing Storage
vercel storage ls             # List storage resources for the project
```

## 6. Environment Variables
Managing secrets and configuration for Next.js frontend or linked backends:
```bash
vercel env ls                                  # List all environment variables for the project
vercel env add NEXT_PUBLIC_API_URL production  # Add a new env var to the Production environment
vercel env rm NEXT_PUBLIC_API_URL              # Remove an env var
vercel env pull .env.development.local         # Pull development env vars into a local .env file
```
*Note: Ensure you copy the relevant `POSTGRES_URL` to `apps/api/.env` since the backend connects to the database, not the Next.js frontend (due to fastmvp's Clean Arch / DDD separation).*

## 7. Domains & Custom URLs
Assigning vanity domains or subdomains to the deployed application:
```bash
vercel domains ls                 # List all custom domains
vercel domains add fastmvp.dev    # Add a custom domain to the project
vercel domains rm fastmvp.dev     # Remove a domain
vercel domains transfer           # Transfer a domain to another Vercel account
vercel domains verify fastmvp.dev # Check the DNS verification status of the domain
vercel alias set <url> <alias>    # Assign a custom alias to a specific deployment URL
```

## 8. Logs, Monitoring, & Analytics
Inspecting runtime behavior and statistics from CLI:
```bash
vercel logs            # Stream runtime logs from your Vercel deployments
vercel logs <url>      # View logs for a specific deployment URL
```

## 9. Teams
Managing organizational access:
```bash
vercel teams add       # Create a new Vercel team
vercel teams ls        # List all teams you belong to
```

## Summary Workflow from Scratch
```bash
# 1. cd to frontend
cd apps/web

# 2. Login & Link
vercel login
vercel link

# 3. Provision Postgres (auto-links if via flow)
vercel storage add postgres

# 4. Pull Environment Variables Locally
vercel env pull .env.development.local

# 5. Set Frontend specific vars
vercel env add NEXT_PUBLIC_API_URL production

# 6. Deploy to Production
vercel deploy --prod

# 7. Add Custom Domain
vercel domains add my-fast-app.com
```
