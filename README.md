# BFI UK Box Office Analytics Dashboard

A full-stack web application for exploring and analysing UK weekend box-office data published by the **British Film Institute (BFI)**.

The project takes raw BFI Weekend Box Office Reports, processes the data using Python and Pandas, stores it in PostgreSQL, exposes it through a Node.js/Express REST API, and presents it through an interactive React frontend.

The project is being developed as a hands-on full-stack learning project, with an emphasis on understanding the technologies and architecture rather than simply producing a working application.

---

## Project Architecture

```text
BFI Weekend Box Office Reports
            ↓
      Python + Pandas
            ↓
     Cleaned CSV data
            ↓
        PostgreSQL
            ↓
     Node.js + Express
            ↓
        REST API
            ↓
          React
            ↓
 Interactive web dashboard
```

TMDB is also used as a supplementary external API for movie metadata and poster images:

```text
React / Node.js
      ↓
  TMDB API
      ↓
Movie metadata + poster paths
```

---

## Project Scope

The application currently focuses on the **Top 15 highest-grossing films** from each BFI weekend report.

The initial project scope is **Summer 2026**, defined for this project as reporting weekends from June through August 2026. This is a project-defined scope and is not intended to represent an official BFI definition of summer.

The raw BFI reports are retained in their original form and are not modified.

---

## Data Pipeline

### 1. BFI Source Data

The project uses the BFI Weekend Box Office Reports as its primary source for UK box-office information.

The raw reports contain multiple sections, including:

* Top 15 films
* Other UK films
* New releases
* Comments and notes
* Upcoming releases

The application currently extracts the Top 15 table.

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

### 2. Python + Pandas

Python and Pandas are used to process the original `.ods` BFI spreadsheets.

The processing pipeline:

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

Python packages used include:

* `pandas`
* `odfpy`

---

## PostgreSQL Database

The cleaned BFI data is stored in a PostgreSQL relational database.

The current database contains four main tables:

```text
distributor
    │
    └── film
          │
          └── weekly_box_office
                    │
                    └── reporting_weekend
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

This allows the same film to appear in multiple reporting weekends while preventing duplicate entries for the same film and reporting weekend.

### Database technologies

* PostgreSQL
* SQL
* Python `psycopg`
* Node.js `pg` package

---

## Node.js + Express REST API

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

### Current API endpoints

#### Reporting weekends

```text
GET /api/reporting-weekends
GET /api/reporting-weekends/:id/movies
```

These endpoints provide reporting-weekend information and the Top 15 films for a selected weekend.

#### Movies

```text
GET /api/movies
GET /api/movies/:id
GET /api/movies/:id/box-office
GET /api/movies/:filmId/box-office/:reportingId
GET /api/movies/:filmId/reporting-weekends
```

The movies endpoint selects the most recent available reporting weekend for each film.

The movie details endpoint allows the user to select different reporting weekends and view the film's performance for that particular weekend.

#### Distributors

```text
GET /api/distributors
GET /api/distributors/:id
GET /api/distributors/:id/movies
```

Distributor pages provide information about distributors and their associated films.

The distributor movies endpoint selects the most recent available reporting weekend for each film belonging to the selected distributor.

---

## TMDB API Integration

The application also integrates with the **TMDB API** to supplement the BFI data with additional movie information.

TMDB is used for information such as:

* Poster image paths
* Release dates
* Movie synopsis/overview
* Original language codes

The BFI remains the authoritative source for the project's box-office information and distributor data.

The application stores TMDB poster paths and language codes in the database and converts ISO 639-1 language codes into readable language names in the React frontend using the `iso-639-1` package.

Examples include:

```text
en → English
hi → Hindi
te → Telugu
ml → Malayalam
ko → Korean
```

TMDB API credentials are stored in environment variables and are not committed to the repository.

### TMDB Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.

---

## React Frontend

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

The frontend does not communicate directly with PostgreSQL.

```text
React
  ↓ HTTP
Express REST API
  ↓ SQL
PostgreSQL
```

---

## Current Pages and Features

### Home

The Home page allows users to:

* Select a BFI reporting weekend
* View the Top 15 films for that weekend
* Navigate to individual movie details
* Preserve the selected reporting weekend when opening movie details

The most recent reporting weekend is selected by default.

### Movies

The Movies page displays films available in the dataset.

Each film uses its most recent available reporting weekend for summary information.

Users can open the detailed movie page and select another reporting weekend where data is available.

### Movie Details

The Movie Details page displays:

* Film title
* Poster
* Release date
* Country of origin
* Original language
* Distributor
* Synopsis
* Total gross to date
* Percentage change on last week
* Weeks on release
* Number of cinemas
* Site average

Users can select different reporting weekends to view the film's historical box-office performance.

### Distributors

The Distributors page displays:

* Distributor name
* Number of films distributed
* A preview selection of associated movie posters

Users can open a distributor's dedicated movie page.

### Distributor Movies

The Distributor Movies page displays all films associated with the selected distributor, along with their relevant movie metadata and latest available box-office information.

### About

The About page documents:

* The purpose of the project
* The BFI data source
* TMDB's role as a supplementary movie-data source
* Required TMDB attribution

---

## Current Project Status

### Completed

* [x] BFI ODS data extraction
* [x] Pandas data cleaning and transformation
* [x] Multi-week BFI report processing
* [x] PostgreSQL database design
* [x] PostgreSQL schema and relationships
* [x] Python database loader
* [x] Node.js backend
* [x] Express REST API
* [x] Backend database integration
* [x] CORS configuration
* [x] Environment variable configuration
* [x] TMDB API integration
* [x] Movie metadata population
* [x] Movie poster integration
* [x] ISO 639-1 language handling
* [x] React frontend
* [x] React Router navigation
* [x] Reporting-weekend selection
* [x] Movie details pages
* [x] Distributor pages
* [x] Distributor movie pages
* [x] API/frontend integration
* [x] Git/GitHub version control

### In Progress / Planned

* [ ] Clean up and refine frontend CSS
* [ ] Improve overall UI/UX
* [ ] Add movie performance charts
* [ ] Add historical box-office visualisations
* [ ] Improve reporting-weekend selection for larger datasets
* [ ] Add more BFI reporting weekends across Summer 2026
* [ ] Expand dashboard analytics
* [ ] Further testing and error handling
* [ ] Consider deployment once the local application is complete

---

## Repository Structure

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
│   └── load_bfi.py
│
├── database/
│   └── schema.sql
│
├── backend/
│   ├── package.json
│   ├── package-lock.json
│   ├── .env
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

---

## Security

Environment variables and sensitive credentials are stored locally in `.env` files and excluded from Git.

The repository `.gitignore` excludes:

* `.env`
* `.venv`
* `node_modules`
* build output
* local IDE files
* generated/local files

Database credentials and the TMDB access token must never be committed to GitHub.

---

## Technologies Used

### Data Processing

* Python
* Pandas
* ODFPy

### Database

* PostgreSQL
* SQL
* psycopg

### Backend

* Node.js
* Express
* `pg`
* CORS
* dotenv

### External API

* TMDB API

### Frontend

* React
* React Router
* JavaScript
* HTML
* CSS
* `iso-639-1`

### Version Control

* Git
* GitHub

---

## Learning Objectives

This project is intended to provide practical experience with:

* Data cleaning and transformation
* Relational database design
* SQL and PostgreSQL
* REST API development
* Node.js and Express
* Backend/frontend separation
* API integration
* React development
* Client-side routing
* Asynchronous JavaScript
* Working with external APIs
* Git and GitHub
* Building a complete full-stack application

The long-term goal is to be able to explain the architecture, design decisions, data flow, and implementation clearly in a technical interview.
