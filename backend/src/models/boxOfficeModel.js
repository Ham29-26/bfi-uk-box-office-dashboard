const pool = require("../db/db");

const getReportingWeekends = async () => {
    const reportingWeekendsAsc = await pool.query(`
        SELECT 
            reporting_id, 
            start_date::TEXT AS start_date, 
            end_date::TEXT AS end_date
        FROM reporting_weekend
        ORDER BY start_date ASC
    `);

    const reportingWeekendsDesc = await pool.query(`
        SELECT 
            reporting_id, 
            start_date::TEXT AS start_date, 
            end_date::TEXT AS end_date
        FROM reporting_weekend
        ORDER BY start_date DESC
    `);

    return {
        reportingWeekendsAsc,
        reportingWeekendsDesc
    };
};

const getMovies = (searchQuery, language, minGross, maxGross, sortQuery) => {
    
    const conditions = [];
    const grossConditions = [];
    const values = [];

    if (searchQuery) {
        values.push(searchQuery);
        const placeholderNumber = values.length;
        conditions.push(`film.film_title ILIKE '%' || $${placeholderNumber} || '%'`);
    }

    if (language) {
        values.push(language);
        const placeholderNumber = values.length;
        conditions.push(`film.original_language = $${placeholderNumber}`);
    }

    if (minGross && maxGross) {
        
        values.push(minGross);
        const minGrossPlaceholder = values.length;

        values.push(maxGross);
        const maxGrossPlaceholder = values.length;

        grossConditions.push(
            `total_gross_to_date BETWEEN $${minGrossPlaceholder} AND $${maxGrossPlaceholder}`
        );

    }

    let whereClause = "";

    if (conditions.length > 0) {
        whereClause = `WHERE ${conditions.join(" AND ")}`;
    }

    let grossWhereClause = "";

    if (grossConditions.length > 0) {
        grossWhereClause = `WHERE ${grossConditions.join(" AND ")}`;
    }

    //set a default order clause in case no sort is applied
    let orderClause = "ORDER BY start_date DESC," 
    + " release_date DESC NULLS LAST,"
    + " total_gross_to_date DESC";

    if (sortQuery === "title-asc") {
        orderClause = "ORDER BY REGEXP_REPLACE(LOWER(film_title), '^[^a-z]+', '') ASC";
    }

    if (sortQuery === "title-desc") {
        orderClause = "ORDER BY REGEXP_REPLACE(LOWER(film_title), '^[^a-z]+', '') DESC";
    }

    if (sortQuery === "release-asc") {
        orderClause = "ORDER BY release_date ASC NULLS LAST";
    }

    if (sortQuery === "release-desc") {
        orderClause = "ORDER BY release_date DESC NULLS LAST";
    }

    if (sortQuery === "gross-asc") {
        orderClause = "ORDER BY total_gross_to_date ASC";
    }

    if (sortQuery === "gross-desc") {
        orderClause = "ORDER BY total_gross_to_date DESC";
    }

    return pool.query(`
        WITH ranked_movies AS (

            SELECT
                film.film_id,
                film.film_title,
                film.country_of_origin,
                film.film_poster_img_path,
                film.release_date::TEXT AS release_date,
                film.synopsis,
                film.original_language,
                weekly_box_office.total_gross_to_date,
                reporting_weekend.reporting_id,
                reporting_weekend.start_date::TEXT AS start_date,
                reporting_weekend.end_date::TEXT AS end_date,
                distributor.distributor_name,
                
                ROW_NUMBER() OVER (
                    PARTITION BY film.film_title
                    ORDER BY reporting_weekend.start_date DESC
                )
                AS row_num

            FROM film

            JOIN distributor
                ON distributor.distributor_id = film.distributor_id

            JOIN weekly_box_office
                ON weekly_box_office.film_id = film.film_id

            JOIN reporting_weekend
                ON reporting_weekend.reporting_id = weekly_box_office.reporting_id

            ${whereClause}
        
        ),

        recent_movies AS (
        
            SELECT
                *,
                MAX(total_gross_to_date) OVER() AS max_total_gross

            FROM ranked_movies

            WHERE row_num = 1
        )

        SELECT *
        FROM recent_movies

        ${grossWhereClause}

        ${orderClause}

    `, values);
};

const getLanguages = () => {
    return pool.query(`
        SELECT original_language
        FROM (
            SELECT DISTINCT original_language
            FROM film
        ) AS languages
        ORDER BY
            CASE
                WHEN original_language = 'en' THEN 0
                ELSE 1
            END,
            original_language ASC;
    `);
}

const getMoviesByReportingWeekend = (reportingId) => {
    return pool.query(`
        SELECT
            film.film_id,
            weekly_box_office.film_rank,
            film.film_title,
            film.country_of_origin,
            film.film_poster_img_path,
            film.release_date::TEXT AS release_date,
            film.synopsis,
            film.original_language,
            distributor.distributor_name,
            weekly_box_office.weekend_gross,
            weekly_box_office.percent_change,
            weekly_box_office.weeks_on_release,
            weekly_box_office.number_of_cinemas,
            weekly_box_office.site_average,
            weekly_box_office.total_gross_to_date
        FROM weekly_box_office
        JOIN film
            ON weekly_box_office.film_id = film.film_id
        JOIN distributor
            ON film.distributor_id = distributor.distributor_id
        WHERE weekly_box_office.reporting_id = $1
        ORDER BY weekly_box_office.film_rank;    
    `, [reportingId]);
};

const getMovieById = (filmId) => {
    return pool.query(`
        SELECT
            film_id, 
            film_title,
            film_poster_img_path,
            country_of_origin,
            release_date::TEXT AS release_date,
            synopsis,
            original_language,
            distributor_name
        FROM film

        JOIN distributor 
        ON distributor.distributor_id = film.distributor_id

        WHERE film.film_id = $1;   
    `, [filmId]);
};

const getMoviePerformanceUpToWeekend = (filmId, reportingId) => {
    return pool.query(`
        SELECT
            film.film_id,
            weekly_box_office.film_rank,
            film.film_title,
            film.film_poster_img_path,
            film.release_date::TEXT AS release_date,
            film.synopsis,
            film.country_of_origin,
            film.original_language,
            weekly_box_office.weekend_gross,
            weekly_box_office.percent_change,
            weekly_box_office.weeks_on_release,
            weekly_box_office.number_of_cinemas,
            weekly_box_office.site_average,
            weekly_box_office.total_gross_to_date,
            reporting_weekend.reporting_id,
            reporting_weekend.start_date::TEXT AS start_date,
            reporting_weekend.end_date::TEXT AS end_date,
            distributor.*
        FROM weekly_box_office
        JOIN film
            ON weekly_box_office.film_id = film.film_id
        JOIN reporting_weekend
            ON weekly_box_office.reporting_id = reporting_weekend.reporting_id
        JOIN distributor
            ON distributor.distributor_id = film.distributor_id
        WHERE weekly_box_office.film_id = $1
            AND reporting_weekend.start_date <= (
                SELECT start_date
                FROM reporting_weekend
                WHERE reporting_id = $2
            )
        ORDER BY reporting_weekend.start_date ASC;
    `, [filmId, reportingId]);
};

const getDistributors = async (searchQuery, sortQuery) => {
    
    const conditions = [];
    const values = [];

    if (searchQuery) {
        values.push(searchQuery);
        const placeholderNumber = values.length;
        conditions.push(`distributor.distributor_name ILIKE '%' || $${placeholderNumber} || '%'`);
    }

    let whereClause = "";

    if (conditions.length > 0) {
        whereClause = `WHERE ${conditions.join(" AND ")}`;
    }

    //set a default order clause in case no sort is applied
    let orderClause = "ORDER BY number_of_films_distributed DESC" 

    if (sortQuery === "name-asc") {
        orderClause = "ORDER BY distributor.distributor_name ASC";
    }

    if (sortQuery === "name-desc") {
        orderClause = "ORDER BY distributor.distributor_name DESC";
    }

    if (sortQuery === "movies-asc") {
        orderClause = "ORDER BY number_of_films_distributed ASC";
    }

    if (sortQuery === "movies-desc") {
        orderClause = "ORDER BY number_of_films_distributed DESC";
    }


    const distributors = await pool.query(`
        SELECT
            distributor.distributor_id,
            distributor.distributor_name,
            COUNT(film.film_id) AS number_of_films_distributed
        FROM film
        JOIN distributor
        ON film.distributor_id = distributor.distributor_id

        ${whereClause}

        GROUP BY distributor.distributor_id
        
        ${orderClause}
    `, values);

    const movies = await pool.query(`
        SELECT
            film_id, 
            film_title, 
            film_poster_img_path,
            distributor.distributor_id
        FROM film
        JOIN distributor
        ON film.distributor_id = distributor.distributor_id 
        ORDER BY release_date DESC; 
    `);

    return {
        distributors, 
        movies
    };
};

const getDistributorById = (distributorId) => {
    return pool.query(`
        SELECT distributor_name
        FROM distributor
        WHERE distributor_id = $1;
    `, [distributorId]);
};

const getMoviesByDistributor = (distributorId, searchQuery, sortQuery) => {
    let searchQueryWhereClause = "";
    let values = [distributorId];

    if (searchQuery) {
        values.push(searchQuery);
        searchQueryWhereClause = `AND film.film_title ILIKE '%' || $2 || '%'`;
    }

    //set a default order clause in case no sort is applied
    let orderClause = "ORDER BY start_date DESC," 
    + " release_date DESC NULLS LAST,"
    + " total_gross_to_date DESC";

    if (sortQuery === "title-asc") {
        orderClause = "ORDER BY film_title ASC";
    }

    if (sortQuery === "title-desc") {
        orderClause = "ORDER BY film_title DESC";
    }

    if (sortQuery === "release-asc") {
        orderClause = "ORDER BY release_date ASC NULLS LAST";
    }

    if (sortQuery === "release-desc") {
        orderClause = "ORDER BY release_date DESC NULLS LAST";
    }

    if (sortQuery === "gross-asc") {
        orderClause = "ORDER BY total_gross_to_date ASC";
    }

    if (sortQuery === "gross-desc") {
        orderClause = "ORDER BY total_gross_to_date DESC";
    } 

    return pool.query(`
        SELECT *
        FROM (
            SELECT
                film.film_id,
                film.film_title,
                film.country_of_origin,
                film.film_poster_img_path,
                film.release_date::TEXT AS release_date,
                film.synopsis,
                film.original_language,
                weekly_box_office.total_gross_to_date,
                reporting_weekend.reporting_id,
                reporting_weekend.start_date::TEXT AS start_date,
                reporting_weekend.end_date::TEXT AS end_date,
                distributor.distributor_name,
                ROW_NUMBER() OVER (
                    PARTITION BY film.film_title
                    ORDER BY reporting_weekend.start_date DESC
                )
                AS row_num
            FROM film
            JOIN distributor
                ON distributor.distributor_id = film.distributor_id
            JOIN weekly_box_office
                ON weekly_box_office.film_id = film.film_id
            JOIN reporting_weekend
                ON reporting_weekend.reporting_id = weekly_box_office.reporting_id
            WHERE distributor.distributor_id = $1
            ${searchQueryWhereClause}
            ${orderClause}
        ) AS recent_film_entries
        WHERE row_num = 1;      
    `, values);
};


const getReportingWeekendsByFilmId = async (filmId) => {
    return pool.query(`
        SELECT 
            reporting_weekend.reporting_id,
            reporting_weekend.start_date::TEXT AS start_date,
            reporting_weekend.end_date::TEXT AS end_date
        FROM weekly_box_office
        JOIN reporting_weekend
            ON weekly_box_office.reporting_id = reporting_weekend.reporting_id
        WHERE weekly_box_office.film_id = $1
        ORDER BY reporting_weekend.start_date ASC;     
    `, [filmId]);
}

module.exports = {
    getReportingWeekends,
    getMovies,
    getLanguages,
    getMoviesByReportingWeekend,
    getMovieById,
    getMoviePerformanceUpToWeekend,
    getDistributors,
    getDistributorById,
    getMoviesByDistributor,
    getReportingWeekendsByFilmId
};