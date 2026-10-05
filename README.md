# BFI UK Box Office Analytics Dashboard

A full-stack web application for exploring and analysing UK weekend box-office data published by the **British Film Institute (BFI)**.

The project processes raw BFI Weekend Box Office Reports using Python and Pandas, stores the data in PostgreSQL, supplements the BFI data with movie metadata from the TMDB API, exposes the data through a Node.js/Express REST API, and presents it through an interactive React frontend.

The project was developed as a hands-on full-stack learning project, with an emphasis on understanding the technologies, architecture, data flow, and design decisions behind the application.

## Live Application

**Live Dashboard:**
https://bfi-uk-box-office-dashboard.bfi.workers.dev/

The application is publicly deployed and can be accessed through the link above.

---

## Project Architecture

### Data processing and database pipeline

```text
BFI Weekend Box Office Reports
            ↓
      Python + Pandas
            ↓
       Cleaned CSV data
            ↓
       Local PostgreSQL
            ↓
   Movie metadata population
          + TMDB
            ↓
      Manual verification
            ↓
      Database comparison
            ↓
      Neon PostgreSQL
```

### Application architecture

```text
                ┌─────────────────────┐
                │   React Frontend    │
                │                     │
                │ Cloudflare Workers  │
                └──────────┬──────────┘
                           │ HTTP
                           ↓
                ┌─────────────────────┐
                │ Node.js + Express   │
                │                     │
                │   Render            │
                └──────────┬──────────┘
                           │ SQL
                           ↓
                ┌─────────────────────┐
                │ PostgreSQL Database │
                │                     │
                │       Neon          │
                └─────────────────────┘
```

TMDB is used as a supplementary external API for movie metadata and poster images.

```text
Node.js metadata script
          ↓
      TMDB API
          ↓
Movie metadata + poster paths
          ↓
      PostgreSQL
```

---

## Project Scope

The application currently focuses on the **Top 15 highest-grossing films** from each BFI weekend report.

The initial dataset covers reporting weekends from **June 2026 onwards**, with the project currently containing the BFI reports that have been processed and verified as they become available.

The raw BFI reports are retained in their original form and are not modified.

New BFI reporting data is intended to be added on a **weekly basis**, as new weekend reports become available.

---

# Data Pipeline

## 1. BFI Source Data

The project uses the BFI Weekend Box Office Reports as its primary source for UK box-office information.

The raw reports contain multiple sections, including:

* Top 15 films
* Other UK films
* New releases
* Comments and notes
* Upcoming releases

The application currently extracts the **Top 15** table.

The relevant box-office fields include:

* Rank
* Film
* Country of Origin
* Weekend Gross
* Distributor
* % Change on Last Week
* Weeks on Release
* Number of Cinemas
* Site Average
* Total Gross to Date

---

## 2. Python + Pandas Processing

Python and Pandas are used to process the original `.ods` BFI spreadsheets.

The processing pipeline is:

```text
data/raw/
    ↓
Read BFI .ods report
    ↓
Identify report dates
    ↓
Extract Top 15 table
    ↓
Clean column structure
    ↓
Convert relevant data types
    ↓
Handle missing percentage values
    ↓
Add reporting weekend dates
    ↓
data/processed/
```

The original BFI files remain untouched.

The processing script supports multiple BFI reports and avoids regenerating processed CSV files when they already exist.

Python packages used include:

* `pandas`
* `odfpy`

---

## 3. Loading Data into PostgreSQL

The processed CSV files are loaded into a local PostgreSQL database for verification and development.

The loading process handles:

* Reporting weekends
* Distributors
* Films
* Weekly box-office records
* Existing records and duplicate reporting weekends

The local database acts as the **staging and verification database** before data is promoted to the production Neon database.

---

# Database

The project uses PostgreSQL as its relational database.

The database contains four main tables:

```text
reporting_weekend
        │
        │
        ↓
weekly_box_office
        ↑
        │
      film
        ↑
        │
  distributor
```

More specifically:

* One distributor can distribute many films.
* One film can appear across multiple reporting weekends.
* One reporting weekend contains many films.
* `weekly_box_office` represents the relationship between a film and a reporting weekend while storing the weekly performance data.

The `weekly_box_office` table uses a composite primary key:

```text
(film_id, reporting_id)
```

This allows the same film to appear across multiple reporting weekends while preventing duplicate entries for the same film and reporting weekend.

### Database technologies

* PostgreSQL
* SQL
* Python `psycopg`
* Node.js `pg`

---

# Weekly Data Population Workflow

The project includes a master script that automates the process of adding new BFI reports.

The complete workflow is:

```text
New BFI .ods report
        ↓
1. Convert ODS → cleaned CSV
        ↓
2. Load CSV → local PostgreSQL
        ↓
3. Populate missing movie metadata
        ↓
4. Manually review metadata
        ↓
5. Compare local PostgreSQL with Neon
        ↓
6. Confirm promotion
        ↓
7. Promote new records → Neon
```

The master script coordinates these stages sequentially.

This allows new BFI weekend reports to be processed using the same repeatable workflow each week.

### Local verification before production

The local PostgreSQL database is treated as a staging environment.

New data is first processed and enriched locally. Movie metadata can then be manually reviewed and corrected before any changes are promoted to the production Neon database.

The production promotion step requires explicit confirmation before writing new records to Neon.

If the user does not confirm the promotion, the Neon database remains unchanged.

---

# Movie Metadata and TMDB Integration

The BFI reports provide the project's authoritative box-office information, but they do not provide all of the movie metadata required by the application.

The project therefore integrates with the **TMDB API** to supplement the BFI data.

TMDB is used for:

* Poster image paths
* Release dates
* Movie synopsis/overview
* Original language codes

The BFI remains the authoritative source for the project's:

* Box-office information
* Distributor information
* Reporting weekend information

The application stores TMDB poster paths and language codes in PostgreSQL and converts ISO 639-1 language codes into readable language names in the React frontend using the `iso-639-1` package.

Examples include:

```text
en → English
hi → Hindi
te → Telugu
ml → Malayalam
ko → Korean
```

TMDB API credentials are stored in environment variables and are not committed to the repository.

---

## TMDB Movie Matching Limitation

Movie metadata is populated by searching TMDB using the film title supplied by the BFI.

Because the BFI and TMDB use different naming conventions, some films may not be matched automatically.

For example, differences may include:

* Capitalisation
* Punctuation
* Alternative title wording
* Additional or missing words
* Subtitle or franchise naming differences

The metadata population script therefore performs an exact title comparison after receiving TMDB search results.

If no matching film is found, the film is reported as **unmatched** so that it can be manually reviewed and matched against the appropriate TMDB entry.

This means that the weekly data-population process may require some **manual administrative intervention** for films whose BFI titles differ from their corresponding TMDB titles.

This does not affect the BFI box-office data itself. It only affects the automatic enrichment of supplementary movie metadata.

The workflow is intentionally designed so that unmatched or questionable metadata can be corrected locally before the data is promoted to the production database.

---

## TMDB Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.

---

# Node.js + Express REST API

The backend is built using **Node.js** and **Express**.

The backend follows a layered structure:

```text
Routes
  ↓
Controllers
  ↓
Models / database queries
  ↓
PostgreSQL
```

The frontend communicates with the backend through HTTP requests rather than connecting directly to PostgreSQL.

Controllers use asynchronous JavaScript with `async/await` for database operations and error handling.

## Current API Endpoints

### Reporting Weekends

```text
GET /api/reporting-weekends

GET /api/reporting-weekends/:id/movies
```

These endpoints provide reporting-weekend information and the Top 15 films for a selected weekend.

### Movies

```text
GET /api/movies

GET /api/movies/:id

GET /api/movies/:filmId/box-office/:reportingId

GET /api/movies/:filmId/reporting-weekends
```

The movies endpoint provides film summary information using each film's most recent available reporting weekend.

The movie details endpoint allows users to select a reporting weekend and view the film's performance history up to that selected weekend.

The reporting-weekends endpoint for a film returns only the reporting weekends in which that film has available box-office data.

The movies endpoint also supports searching, filtering, sorting, and pagination.

### Distributors

```text
GET /api/distributors

GET /api/distributors/:id

GET /api/distributors/:id/movies
```

Distributor pages provide information about distributors and their associated films.

The distributor movies endpoint provides the films associated with the selected distributor along with their latest available box-office information.

---

# React Frontend

The frontend is built using **React** and consumes the Express REST API.

Current React concepts used include:

* Components
* Props
* State
* `useState`
* `useEffect`
* Event handling
* Conditional rendering
* Fetching API data
* Dynamic rendering with `.map()`
* React Router
* Route parameters
* Navigation between pages
* URL query parameters

The frontend does not communicate directly with PostgreSQL.

```text
React
  ↓ HTTP
Express REST API
  ↓ SQL
PostgreSQL
```

The frontend also uses **Recharts** to provide interactive historical box-office visualisations.

---

# Current Pages and Features

## Home

The Home page allows users to:

* Select a BFI reporting weekend
* View the Top 15 films for that weekend
* Navigate to individual movie details
* Preserve the selected reporting weekend when opening movie details
* Default to the most recent available reporting weekend

---

## Movies

The Movies page displays films available in the dataset.

Features include:

* Movie search
* Language filtering
* Total-gross filtering
* Sorting by title
* Sorting by release date
* Sorting by gross
* Ascending and descending sort options
* Pagination
* Most recent available reporting weekend information

Each film can be opened to view its detailed page.

---

## Movie Details

The Movie Details page displays:

* Film title
* Poster
* Film rank for the selected weekend
* Release date
* Country of origin
* Original language
* Distributor
* Synopsis
* Weekend gross
* Total gross to date
* Percentage change on last week
* Weeks on release
* Number of cinemas
* Site average

Users can select different reporting weekends where the film has available data.

Historical performance is visualised using interactive Recharts line charts for:

* Weekend Gross
* Total Gross to Date

The charts retain the underlying weekly data while presenting aggregated month-based X-axis labels when the dataset becomes large enough to require improved readability.

Users can hover over individual points to view the corresponding reporting weekend and performance information.

---

## Distributors

The Distributors page displays:

* Distributor name
* Number of films distributed
* Preview selections of associated movie posters
* Pagination

Users can open a distributor's dedicated movie page.

---

## Distributor Movies

The Distributor Movies page displays all films associated with the selected distributor.

Features include:

* Movie search
* Sorting
* Pagination
* Movie metadata
* Latest available box-office information

---

## About

The About page documents:

* The purpose of the project
* The BFI data source
* TMDB's role as a supplementary movie-data source
* Required TMDB attribution

---

## Navigation and URL State

The application uses React Router for client-side navigation.

Selected reporting weekends and movie filters can also be represented through URL query parameters, allowing relevant application state to be preserved when navigating or sharing a page.

The Home page defaults to the latest available reporting weekend without unnecessarily modifying the URL on the initial visit.

---

# Deployment

The application is deployed as a multi-service full-stack application.

```text
                         GitHub
                           │
             ┌─────────────┴─────────────┐
             ↓                           ↓
     Cloudflare Workers                Render
       React Frontend              Node + Express API
             │                           │
             │                           ↓
             │                         Neon
             │                       PostgreSQL
             │
             └──────── HTTP/API ────────┘
```

### Frontend

The React frontend is deployed using **Cloudflare Workers** as a static web application.

### Backend

The Node.js/Express REST API is hosted on **Render**.

### Production Database

The production PostgreSQL database is hosted on **Neon**.

### Source Control

The project source code is maintained in Git and hosted on **GitHub**.

---

# Current Dataset

The current dataset contains:

* **39 BFI reporting weekends**
* **241 unique films**
* **67 distributors**
* **585 weekly box-office records**

Each reporting weekend can contain up to 15 Top 15 films, although the number of unique films across the dataset is lower than the total number of weekly records because films can appear across multiple reporting weekends.

New reporting weekends will continue to be added as BFI reports become available.

---

# Project Status

The project is now **completed and deployed**.

### Completed

* [x] BFI ODS data extraction
* [x] Pandas data cleaning and transformation
* [x] Multi-week BFI report processing
* [x] PostgreSQL database design
* [x] PostgreSQL schema and relationships
* [x] Python database loader
* [x] Duplicate reporting-weekend handling
* [x] Node.js backend
* [x] Express REST API
* [x] Backend database integration
* [x] CORS configuration
* [x] Environment variable configuration
* [x] TMDB API integration
* [x] Movie metadata population
* [x] TMDB movie matching and unmatched-film reporting
* [x] Movie poster integration
* [x] ISO 639-1 language handling
* [x] React frontend
* [x] React Router navigation
* [x] Reporting-weekend selection
* [x] Movie details pages
* [x] Historical movie performance data
* [x] Recharts historical box-office visualisations
* [x] Responsive metric and card layouts
* [x] Movie search
* [x] Movie filtering
* [x] Movie sorting
* [x] Distributor search
* [x] Distributor sorting
* [x] Pagination
* [x] Distributor pages
* [x] Distributor movie pages
* [x] URL-based application state
* [x] API/frontend integration
* [x] Controller `async/await` refactoring
* [x] Weekly data-processing workflow
* [x] Local database verification workflow
* [x] Local-to-Neon database comparison
* [x] Production database promotion workflow
* [x] Transaction-safe Neon promotion
* [x] Manual verification gate before production promotion
* [x] Git/GitHub version control
* [x] Production deployment
* [x] Frontend deployment
* [x] Backend deployment
* [x] Production PostgreSQL deployment
* [x] Final frontend cleanup and refinement

### Ongoing

* [ ] Add new BFI reporting weekends as reports become available
* [ ] Manually resolve TMDB matches where BFI and TMDB film titles differ

The application itself is complete; ongoing work is primarily **weekly data ingestion and manual metadata verification where required**.

---

# Repository Structure

```text
bfi-uk-box-office-dashboard/

│
├── README.md
├── .gitignore
│
├── data/
│   ├── raw/
│   └── processed/
│
├── scripts/
│   ├── inspect_bfi.py
│   ├── load_bfi.py
│   └── promote_to_neon.py
│
├── database/
│   └── schema.sql
│
├── backend/
│   ├── package.json
│   ├── package-lock.json
│   ├── test_tmdb.js
│   ├── populate_movie_metadata.js
│   └── src/
│       ├── server.js
│       ├── routes/
│       ├── controllers/
│       ├── models/
│       └── db/
│
└── frontend/
    ├── package.json
    ├── package-lock.json
    ├── public/
    └── src/
        ├── App.jsx
        ├── Header.jsx
        ├── Home.jsx
        ├── MovieCard.jsx
        ├── About.jsx
        ├── Movies.jsx
        ├── MovieDetails.jsx
        ├── Distributors.jsx
        ├── DistributorMovies.jsx
        └── assets/
```

The project also includes a master data-population script that coordinates the weekly processing workflow.

---

# Security

Environment variables and sensitive credentials are stored locally in `.env` files and excluded from Git.

The repository `.gitignore` excludes sensitive and generated files such as:

* `.env`
* `.env.*`
* `.venv`
* `node_modules`
* Build output
* Local IDE files
* Generated/local files

Database credentials and the TMDB access token must never be committed to GitHub.

The production database promotion workflow uses a separate Neon environment configuration and requires explicit confirmation before writing new records to the production database.

---

# Technologies Used

## Data Processing

* Python
* Pandas
* ODFPy

## Database

* PostgreSQL
* SQL
* `psycopg`

## Backend

* Node.js
* Express
* `pg`
* CORS
* dotenv

## External API

* TMDB API

## Frontend

* React
* React Router
* Recharts
* JavaScript
* HTML
* CSS
* `iso-639-1`

## Deployment

* Neon
* Render
* Cloudflare Workers

## Version Control

* Git
* GitHub

---

# Learning Objectives

This project was built to provide practical experience with:

* Data cleaning and transformation
* Relational database design
* SQL and PostgreSQL
* REST API development
* Node.js and Express
* Backend/frontend separation
* API integration
* React development
* Client-side routing
* URL-based application state
* Asynchronous JavaScript
* Working with external APIs
* Data visualisation
* Responsive frontend design
* Production deployment
* Environment configuration
* Git and GitHub
* Database migration and promotion workflows
* Building and maintaining a complete full-stack application

A major goal of the project was to understand the architecture and implementation decisions well enough to explain the complete system clearly in a technical interview.

---

# Live Demo

**BFI UK Box Office Analytics Dashboard**

https://bfi-uk-box-office-dashboard.bfi.workers.dev/

Built by **Hamza Kazi**.
