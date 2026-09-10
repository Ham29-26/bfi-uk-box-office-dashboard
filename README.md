# BFI UK Box Office Dashboard

A full-stack analytics dashboard built using real-world UK box office data published by the British Film Institute (BFI).

## Project Goal

The goal of this project is to transform raw BFI box office reports into a cleaned, structured dataset and build an interactive web application for analysing UK cinema box office performance.

The project currently focuses on the BFI Top 15 weekend box office films and is being developed using weekly reports from summer 2026 (June–August).

## Technology Stack

* Python / Pandas — data cleaning and processing
* PostgreSQL — relational database
* Node.js / Express — backend REST API
* React — frontend dashboard
* Git / GitHub — version control

## Data Pipeline

The project follows the following data pipeline:

```text
BFI ODS Reports
      ↓
Python / Pandas
      ↓
Cleaned CSV Files
      ↓
PostgreSQL Database
      ↓
Node.js / Express REST API
      ↓
React Dashboard
```

## Data Processing

Raw BFI weekend box office reports are stored in `data/raw/` and processed using Python and Pandas.

The processing script:

* Reads BFI `.ods` spreadsheet reports
* Extracts the Top 15 films
* Removes unnecessary spreadsheet structure and columns
* Cleans and converts numerical values
* Handles missing percentage-change values
* Extracts the reporting weekend dates
* Adds reporting period metadata to each record
* Generates a processed CSV file for each reporting weekend
* Skips reports that have already been processed

Processed CSV files are stored in `data/processed/`.

## Database

The processed data is stored in a PostgreSQL relational database.

The database consists of four main tables:

### Distributor

Stores unique film distributors.

### Film

Stores film information and links each film to its distributor.

### Reporting Weekend

Stores the start and end dates for each BFI reporting weekend.

### Weekly Box Office

Stores the box office performance of each film for a specific reporting weekend.

The `weekly_box_office` table uses a composite primary key consisting of `film_id` and `reporting_id`. This allows the same film to appear across multiple reporting weekends while preventing duplicate records for the same film and weekend.

The main relationships are:

```text
Distributor 1 ──── * Film
                    │
                    │
                    * Weekly Box Office * ──── 1 Reporting Weekend
```

## Current Dataset

The database currently contains BFI Top 15 data for two reporting weekends:

* 05–07 June 2026
* 12–14 June 2026

This currently represents:

* 2 reporting weekends
* 15 films per report
* 30 weekly box office records

The data pipeline has also been tested with films and distributors that appear across multiple reporting weekends, as well as new films and distributors appearing in later reports.

## Current Progress

* [x] Project repository created
* [x] Initial project structure created
* [x] Obtain and inspect BFI datasets
* [x] Clean and transform the data
* [x] Design and create the PostgreSQL database
* [x] Load processed BFI data into PostgreSQL
* [x] Test multiple reporting weekends
* [x] Validate database data against the BFI reports
* [ ] Build the REST API
* [ ] Build the React frontend
* [ ] Connect frontend and backend
* [ ] Add analytics and visualisations
* [ ] Optional: Docker
* [ ] Optional: Cloud deployment

## Project Structure

```text
bfi-uk-box-office-dashboard/
├── README.md
├── data/
│   ├── raw/
│   │   └── BFI-weekend-box-office-report-*.ods
│   └── processed/
│       └── bfi_box_office_*.csv
├── scripts/
│   ├── inspect_bfi.py
│   └── load_bfi.py
├── sql/
│   └── schema.sql
└── .venv/
```

## Future Development

The next stage of the project will focus on building a Node.js and Express REST API to provide controlled access to the PostgreSQL data.

The API will eventually be consumed by the React frontend to provide an interactive dashboard for exploring weekly box office performance, rankings and other analytics.

