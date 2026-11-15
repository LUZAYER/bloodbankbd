# BloodBond Bangladesh (ব্লাডবন্ড বাংলাদেশ)

> **AI-Powered Emergency Blood Donor Finder & Matching Platform across all 64 Districts of Bangladesh**

BloodBond Bangladesh is a production-grade, full-stack healthcare application engineered to connect patients with voluntary, clinically compatible, and currently eligible blood donors during medical emergencies.

---

## 📁 Production Directory Structure

The entire project is organized within this single repository root following enterprise software architecture standards:

```text
Blood Donor Finder System/
├── src/                              # Main application source code
│   ├── app/                          # Next.js 14 App Router (Pages, Layouts, API routes)
│   │   ├── about/                    # About & medical safety standards page
│   │   ├── admin/                    # Administrator control center
│   │   ├── api/                      # Enterprise REST API Endpoints
│   │   │   ├── admin/                # Policy editor, audit logs, user management
│   │   │   ├── ai/                   # AI query parsing endpoints
│   │   │   ├── auth/                 # JWT session auth (login, register, logout, me)
│   │   │   ├── donor/                # Donor profiles & history
│   │   │   ├── donors/               # Live interactive map endpoints
│   │   │   ├── geo/                  # Divisions, districts, upazilas endpoints
│   │   │   ├── health/               # Production uptime & database health check
│   │   │   ├── matching/             # Proximity & compatibility search engine
│   │   │   ├── notifications/        # Notification dispatch & read markers
│   │   │   ├── requests/             # Emergency request management & responses
│   │   │   └── seeker/               # Seeker dashboards & active alerts
│   │   ├── dashboard/                # Central portal routing
│   │   ├── donor/                    # Donor availability toggle & response dashboard
│   │   ├── login/                    # Secure authentication portal
│   │   ├── map/                      # Nationwide live Leaflet interactive map
│   │   ├── notifications/            # In-app alert dispatch center
│   │   ├── register/                 # Donor & Seeker onboarding workflows
│   │   ├── requests/                 # Emergency blood request forms & detail views
│   │   ├── search/                   # Dual standard + NLP emergency search
│   │   ├── seeker/                   # Blood seeker coordination dashboard
│   │   ├── globals.css               # Tailwind CSS medical theme & styling
│   │   ├── layout.tsx                # Root layout with ThemeProvider & Navigation
│   │   └── page.tsx                  # Landing page & emergency quick-finder
│   ├── components/                   # Reusable UI component library
│   │   ├── Navbar.tsx                # Responsive top navigation bar
│   │   ├── Footer.tsx                # Footer with compliance & emergency notices
│   │   ├── ThemeProvider.tsx         # Dark/Light mode React context
│   │   ├── ThemeToggle.tsx           # Dark mode toggle widget
│   │   └── map/                      # Leaflet interactive map components
│   ├── data/                         # Static datasets
│   │   └── bangladesh-geo.ts         # 8 Divisions, 64 Districts, Thanas & GPS coordinates
│   └── lib/                          # Core business logic & services
│       ├── ai-service.ts             # Bilingual NLP parser & AI microservice connector
│       ├── auth.ts                   # Bcrypt password hashing & JWT cookie auth
│       ├── blood-compatibility.ts    # Deterministic RBC compatibility matrix
│       ├── eligibility.ts            # Clinical 90-day cooldown calculation engine
│       ├── matching-engine.ts        # Haversine distance & progressive tiered matching
│       ├── notifications.ts          # SMS/Email notification dispatch client
│       └── prisma.ts                 # Database client singleton
│
├── ml/                               # Machine Learning Microservice (Flask / Scikit-Learn)
│   ├── app.py                        # Flask REST microservice API
│   ├── ranker.py                     # ML Donor ranking engine
│   ├── nlp_parser.py                 # Natural language query parsing (EN & BN)
│   ├── train_model.py                # Model training pipeline
│   ├── evaluate.py                   # Model evaluation script
│   ├── retrain.py                    # Automated retraining routine
│   ├── requirements.txt              # Python dependencies
│   ├── Dockerfile                    # Containerization for ML microservice
│   ├── evaluation_report.txt         # Evaluation metrics report
│   └── models/                       # Pre-trained Scikit-Learn models
│       ├── donor_ranker.pkl          # Trained Random Forest donor ranking model
│       ├── scaler.pkl                # Standard feature scaler
│       └── model_meta.json           # Model metadata & feature definitions
│
├── prisma/                           # Database Schema & ORM
│   ├── schema.prisma                 # Prisma schema definition
│   └── dev.db                        # Development SQLite database
│
├── scripts/                          # DevOps, cron, and database maintenance scripts
│   ├── seed.mjs                      # Seed Bangladesh geo data, policy, and test donors
│   ├── cron-eligibility.mjs          # Scheduled eligibility recalculation job
│   ├── prepare-prisma.mjs            # Auto-detect SQLite vs PostgreSQL for Prisma
│   └── render-build.sh               # Render cloud build & automated migration runner
│
├── tests/                            # Automated testing suite
│   └── matching-and-eligibility.test.ts # Vitest unit & integration tests
│
├── public/                           # Static assets & web metadata
│   ├── favicon.svg                   # Vector brand favicon
│   ├── robots.txt                    # Search engine crawler policies
│   └── site.webmanifest              # PWA manifest
│
├── legacy/                           # Archived prototype files (PHP / SQLite reference)
│   ├── config/                       # Prototype PDO configuration
│   ├── css/                          # Prototype CSS stylesheets
│   ├── database/                     # Historical SQL migration scripts
│   └── includes/                     # Historical procedural helper scripts
│
├── .env                              # Active environment configuration
├── .env.example                      # Environment variables template
├── .gitignore                        # Comprehensive production git ignore rules
├── Dockerfile                        # Multi-stage production container build (Next.js)
├── docker-compose.yml                # Multi-container orchestration (Web + ML service)
├── next.config.mjs                   # Next.js production configuration
├── package.json                      # Unified root package.json
├── package-lock.json                 # Lockfile for reproducible builds
├── postcss.config.js                 # PostCSS configuration
├── render.yaml                       # Render 1-click cloud Blueprint specification
├── tailwind.config.js                # Tailwind CSS configuration with custom theme
├── tsconfig.json                     # TypeScript compiler configuration
└── vitest.config.ts                  # Vitest configuration for automated test suite
```

---

## 🌟 Key Features

1. **Two-Stage Matching Architecture**:
   - **Stage 1: Deterministic Eligibility & Compatibility Filter**:
     - Enforces clinical Red Blood Cell (RBC) compatibility rules (e.g. O- universal RBC donor, O+ recipient safely receives O+ or O-, AB+ universal recipient).
     - Enforces the 90-day medical safety cooldown interval before ranking candidates.
     - Never allows machine learning or LLMs to override biological safety.
   - **Stage 2: Geographic & Proximity Ranking**:
     - Prioritizes **Exact Neighborhood matches** (e.g., Wari, Dhaka) first.
     - Computes real-time Haversine proximity distances (in km) to the hospital.
     - Ranks candidates by verified profile status, historical emergency response rate, and donation experience.
     - Expands progressively across **Same Thana → Same District → Division**.

2. **Full Bangladesh Geographic Dataset**:
   - Covers all **8 Divisions** (Dhaka, Chattogram, Rajshahi, Khulna, Barishal, Sylhet, Rangpur, Mymensingh).
   - Covers all **64 Districts** with GPS coordinates and Bengali names.
   - Includes key Thanas/Upazilas and micro-neighborhoods (e.g. Wari Rankin Street, Tikatuli, Narinda, Dhanmondi, Mirpur, Agrabad, Zindabazar).

3. **Natural Language AI Query Parser**:
   - Converts natural language queries into validated structured search parameters.
   - Works in both **English and Bangla** (e.g., `"I need O positive blood near Wari Hospital urgently today"` or `"জরুরী ও পজিটিভ রক্ত লাগবে ওয়ারী এলাকায়"`).
   - Robust local deterministic fallback ensures zero reliance on paid external APIs.

4. **Donation Eligibility & Cooldown Tracking**:
   - Automatic calculation of estimated next eligibility date based on last donation date and policy interval (default: 90 days).
   - Real-time client countdown and background scheduled recalculation job (`npm run cron:eligibility`).
   - Prevents invalid or future donation dates.
   - Distinguishes system-calculated provisional eligibility from clinical medical crossmatching.

5. **Role-Based Access Control**:
   - **Donor**: Profile management, availability toggle (Available / Unavailable / Temporarily Busy), donation logs, emergency request alerts with Accept/Decline actions.
   - **Blood Seeker**: Post emergency blood requests, track status (OPEN, MATCHED, FULFILLED, CANCELLED), direct contact flow.
   - **Administrator**: User verification workflows, platform statistics, eligibility policy editor, immutable audit logs.

6. **Privacy & Security**:
   - Contact numbers are masked for anonymous public search visitors (`01711***111`).
   - Bcrypt password hashing and HTTP-only signed JWT session tokens.
   - Audit trail for sensitive administrative and emergency actions.

---

## 🏗️ Technology Stack

- **Framework**: Next.js 14 (App Router, React 18, TypeScript)
- **Styling**: Tailwind CSS with custom medical theme & dark mode
- **Database & ORM**: SQLite / PostgreSQL via Prisma ORM
- **Testing**: Vitest automated unit & integration test suite
- **Machine Learning**: Python Flask microservice, Scikit-Learn (`RandomForestClassifier`, `StandardScaler`), Pandas, NumPy
- **Containerization**: Multi-stage Docker, Docker Compose

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+ or v20 LTS recommended)
- Python 3.10+ (for running the Python ML microservice)
- npm

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Initialization & Seeding
```bash
# Generate Prisma Client
npm run prisma:generate

# Sync database schema
npm run db:push

# Seed Bangladesh 64 districts, divisions, thanas, national policy, and test donors
npm run db:seed
```

### 4. Run Automated Tests
```bash
npm run test
```

### 5. Start the Web Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. (Optional) Run ML Microservice
```bash
# Install Python dependencies
pip install -r ml/requirements.txt

# Start Flask ML microservice on port 5000
npm run ml:dev
```

---

## ☁️ Deploy to Render (1-Click & Production Setup)

The repository is pre-configured with a Render Blueprint ([render.yaml](file:///home/luzayer/AI/Rafi/Blood%20Donor%20Finder%20System/render.yaml)) and automated build/migration script ([scripts/render-build.sh](file:///home/luzayer/AI/Rafi/Blood%20Donor%20Finder%20System/scripts/render-build.sh)).

### Option A: 1-Click Render Blueprint (Recommended)
1. Push this repository to **GitHub** or **GitLab**.
2. Go to the [Render Dashboard](https://dashboard.render.com).
3. Click **New +** > **Blueprint**.
4. Select your repository.
5. Render reads [render.yaml](file:///home/luzayer/AI/Rafi/Blood%20Donor%20Finder%20System/render.yaml), automatically sets up the build command, health check (`/api/health`), generates secrets, syncs the database, and deploys the live app!

### Option B: Manual Web Service Setup on Render
If creating a Web Service manually via Render Dashboard:

| Setting | Value |
| :--- | :--- |
| **Environment** | `Node` |
| **Node Version** | `20` (or `18`) |
| **Build Command** | `npm run build:render` |
| **Start Command** | `npm run start:render` |
| **Health Check Path** | `/api/health` |
| **Plan** | `Free` |

#### Environment Variables to Set on Render:
- `NODE_ENV`: `production`
- `JWT_SECRET`: (Click *Generate* for a 32+ character random secret)
- `NEXT_PUBLIC_APP_NAME`: `BloodBond Bangladesh`
- `AI_PROVIDER`: `rule_based`
- `DATABASE_URL`: `file:./dev.db` *(default zero-config SQLite)* or your Render PostgreSQL Internal Connection String.

> **PostgreSQL Auto-Detection**: When you link a Render PostgreSQL database via `DATABASE_URL` (`postgres://...`), the build script (`prepare-prisma.mjs`) automatically switches Prisma from SQLite to PostgreSQL without requiring manual code changes.

---

## 🐳 Docker Deployment

To launch the entire platform (Next.js web application + Python ML microservice) using Docker Compose:

```bash
docker-compose up --build
```
- **Web App**: [http://localhost:3000](http://localhost:3000)
- **ML Microservice**: [http://localhost:5000](http://localhost:5000)

---

## 👥 Seed Test Accounts

The seed script creates pre-configured demo accounts for testing:

| Role | Mobile / Identifier | Password | Description |
| :--- | :--- | :--- | :--- |
| **Donor (Wari O+)** | `01711111111` | `DonorPassword123!` | Tanvir Ahmed (Rankin Street, Wari, Dhaka) |
| **Donor (Wari O-)** | `01711111114` | `DonorPassword123!` | Farhana Akter (Universal Donor, Wari) |
| **Donor (Wari Cooldown)** | `01711111113` | `DonorPassword123!` | Kamal Hossain (Donated 20 days ago, in cooldown) |
| **Blood Seeker** | `01811111111` | `SeekerPassword123!` | Seeker with active emergency request |
| **Administrator** | `admin@bloodbond.bd` | `AdminPassword123!` | System administrator console |

---

## 🧪 Background Eligibility Cron Job

To run the periodic background eligibility recalculation job:
```bash
npm run cron:eligibility
```

---

## 📄 Clinical Disclaimer

BloodBond Bangladesh is a voluntary humanitarian donor discovery platform. Clinical crossmatching, transfusion safety screening, and infectious disease testing must always be conducted by certified medical personnel and licensed blood banks before transfusion.
