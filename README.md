# Card Portfolio

A highly interactive, dynamic React portfolio backed by an integrated Express admin panel. This system utilizes a bespoke JSON-powered Content Management System (CMS) that persists data either entirely locally for incredibly fast development or streams transparently into Google Cloud Storage for global production deployments. It has been built and refined for a stunning visual delivery, functioning as a high-fidelity template.

## Key Features

- **Interactive 3D Elements:** Leverages Three.js and `@react-three/fiber` alongside GSAP for deeply visceral and immersive animations.
- **Dynamic Configuration & CMS:** A protected, built-in `/admin` dashboard that orchestrates drag-and-drop structural organization, dynamic top-level global settings (like site names and theme colors), and secure media file uploads.
- **Lightweight Architecture:** Eliminates the need for Postgres or complex traditional databases. The repository manages data via local `.json` documents which map directly into isolated Cloud Storage buckets upon production deployment.
- **Responsive "Card" Layout:** Mobile-friendly, elegantly spaced content layers that mimic a stack of visually continuous index cards.
- **Zero-Downtime Deployment:** Includes configured GitHub Actions workflows for Workload Identity Federation building standard Docker containers directly to Google Cloud Run.

---

## Tech Stack

- **Language**: TypeScript / Node.js 20+
- **Frontend Framework**: React 19 via Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI Primitives (Accessible, Unstyled Components)
- **Animations / 3D**: GSAP, React Three Fiber
- **Backend API**: Express
- **Storage / Database**: Flat JSON Files & Google Cloud Storage
- **Deployment**: Google Cloud Run & Artifact Registry

---

## Prerequisites

- **Node.js**: v20 or higher
- **NPM**
- (Optional, Production Only) **Google Cloud Project** for Cloud Storage buckets and Cloud Run artifact registries.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/aaiiintt/card-portfolio.git
cd card-portfolio
```

### 2. Install Dependencies

You need to establish all of the dependencies for both the Express Server and the Vite React scaffolding. Due to the architecture, these commands exist in a singular `package.json`.

```bash
npm install
```

### 3. Environment Setup

Running locally requires virtually no specific layout because the application is designed to gracefully fallback to using exact physical representations of JSON schemas and `public/uploads` directories rather than calling the cloud on native processes.

However, to safely administer the CMS Dashboard, you will want an `ADMIN_PASSWORD`. 
Create a `.env` file or export this inline when beginning your instance.

```bash
# Example local execution with the admin dashboard unlocked
ADMIN_PASSWORD="supersecretpassword" npm run dev
```

### 4. Start Development Server

The repository leverages `concurrently` to orchestrate both the Vite HMR server and the Express API server. Start both using:

```bash
npm run dev
```

- Open the **Main Frontend Portfolio**: [http://localhost:5173/](http://localhost:5173/)
- Open the **Admin Dashboard**: [http://localhost:5173/admin/index.html](http://localhost:5173/admin/index.html) _(Provide the `ADMIN_PASSWORD` you provided on start)_

---

## Architecture

### Directory Structure

```
├── .github/          # GitHub Action Workflows for Cloud Run deployment 
├── public/           # Static global assets (Fonts, favicons, etc)
│   └── admin/        # Admin Dashboard Vanilla JS / HTML shell
├── scripts/          # Shell utilities, e.g. WIF config automation
├── server/           # Express Backend Logic
│   ├── config.js       # Runtime evaluation flags and Default System Layouts
│   ├── index.js        # Main express server entry point
│   ├── routes/api.js   # Authorization checks, dynamic JSON CMS routing
│   └── services/storage.js # Multiplexed module resolving Local vs Cloud Storage
├── src/              # React Application 
│   ├── components/     # UI Level Shared Components (Radix UI pieces)
│   ├── content/        # The Local Sandbox Database (JSON files)
│   ├── lib/            # Utility and helper functions
│   ├── sections/       # Primary Route and Page structures (e.g., ReceiptHeader)
│   ├── App.tsx         # The main iterative configuration tree logic
│   └── main.tsx        # React mounting bootstrap
├── Dockerfile        # The multi-stage lightweight build runner
└── vite.config.ts    # Frontend routing and port mappings
```

### Request Lifecycle

1. **User Client** accesses the React frontend.
2. The App performs a standard **Fetch** intercepting React context hitting `/api/content/site_config`.
3. The Express Backend analyzes structural `site_config.json` instructions. 
4. The system iterates returning dedicated JSON manifests for individual active pages.
5. The React App orchestrates the dynamic hierarchy via specific UI Section configurations utilizing global Tailwind colors and dynamic GSAP instances.

### The Admin Content Management System

The core design philosophy rests heavily on absolute user mutability. Using the `public/admin/index.html` interface with your securely allocated `ADMIN_PASSWORD`:
- Users can dynamically reorder the structure of pages and inject custom accent colors deeply affecting contrast checks entirely inside memory without physically rewriting React logic.
- Adding cards physically executes Multer file stream arrays mapping data via `POST` routes natively into static JS structures or up into scalable backend architecture.

---

## Deployment

The platform embraces a multi-stage Docker container natively executing inside **Google Cloud Run** with images handled through **Artifact Registry**.

### Automated Deployments (GitHub Actions)

Deployments are strictly automated via the GitHub `.github/workflows/deploy.yml` pipeline. 

Your GitHub repository relies heavily on:
1. **WIF_PROVIDER** (Google Cloud Workload Identity Federation configuration)
2. **WIF_SERVICE_ACCOUNT** (Authorized IAM Email mapping your pipeline)
3. **ADMIN_PASSWORD** (As a repository secret for production dashboard access)

The pipeline will trigger automatically upon updating the `main` branch. It will construct a Docker image from the source code, push to GCP Artifact Registry, and launch a fast managed container onto Cloud Run.

### Manual Docker Validation

You can validate exactly what Cloud Run executes locally. 

```bash
# Build the production payload
docker build -t card/portfolio .

# Execute isolated inside port 8080 targeting purely simulated Production flags
docker run -p 8080:8080 -e NODE_ENV=production -e ADMIN_PASSWORD=localtest card/portfolio
```

---

## Troubleshooting

### Uploads Fail via Admin Panel
**Error:** `Failed to read or write local configurations. API routes return 500.`
**Solution:** Check local disk permissions for the user account inside the underlying `public/uploads` directory. The multer proxy demands standard `r/w` disk authorization unless routing purely toward a mapped `GCS_BUCKET` on production.

### Cloud Run Container Fails to Build
**Error:** `Cannot find module dependencies or missing dev rules.`
**Solution:** Check `server/index.js` pathing. Ensure the Express layer correctly targets fallback dependencies in a post-build environment. Note the Dockerfile strips developer dependencies (`npm ci --omit=dev`), therefore your project must ensure frontend UI requirements compile thoroughly inside the `builder` stage layer safely inside the `dist` array.
