-- Distributor information.
-- Each distributor is stored once and can be associated with multiple films.
CREATE TABLE distributor (
    distributor_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    distributor_name TEXT NOT NULL
);

-- Film information.
-- Each film belongs to one distributor.
-- Poster image path is nullable because posters will be added during the frontend stage.
CREATE TABLE film (
    film_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    film_title TEXT NOT NULL,
    country_of_origin TEXT NOT NULL,
    film_poster_img_path TEXT,
    distributor_id INTEGER NOT NULL,
    FOREIGN KEY (distributor_id) REFERENCES distributor(distributor_id)
);

-- Stores the date range represented by each BFI weekend report.
-- Each reporting weekend can contain multiple films.
CREATE TABLE reporting_weekend (
    reporting_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);

-- Stores the weekly box office performance of each film.
-- A film can appear in multiple reporting weekends.
-- The composite primary key prevents the same film from being inserted
-- more than once for the same reporting weekend.
CREATE TABLE weekly_box_office (
    film_id INTEGER NOT NULL,
    reporting_id INTEGER NOT NULL,
    film_rank INTEGER NOT NULL,
    weekend_gross DECIMAL NOT NULL,
    percent_change DECIMAL,
    weeks_on_release INTEGER NOT NULL,
    number_of_cinemas INTEGER NOT NULL,
    site_average DECIMAL NOT NULL,
    total_gross_to_date DECIMAL NOT NULL,

    PRIMARY KEY (film_id, reporting_id),

    FOREIGN KEY (film_id) REFERENCES film(film_id),
    FOREIGN KEY (reporting_id) REFERENCES reporting_weekend(reporting_id)
);

-- Prevents duplicate distributor names.
ALTER TABLE distributor
ADD CONSTRAINT distributor_name_unique UNIQUE (distributor_name);

-- Prevents duplicate film titles.
ALTER TABLE film
ADD CONSTRAINT film_title_unique UNIQUE (film_title);