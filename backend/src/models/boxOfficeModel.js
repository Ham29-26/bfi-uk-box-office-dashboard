const pool = require("../db/db");

const getReportingWeekends = () => {
    return pool.query(`
        SELECT 
            reporting_id, 
            start_date::TEXT AS start_date, 
            end_date::TEXT AS end_date
        FROM reporting_weekend
        ORDER BY start_date DESC
    `);
};

const getMovies = () => {
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
            ORDER BY film.release_date DESC, reporting_weekend.start_date DESC
        ) AS recent_film_entries
        WHERE row_num = 1;  
    `);
};

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

const getMoviePerformanceById = (filmId, reportingId) => {
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
            AND weekly_box_office.reporting_id = $2;
    `, [filmId, reportingId]);
};

const getDistributors = async () => {
    const distributors = await pool.query(`
        SELECT
            distributor.distributor_id,
            distributor.distributor_name,
            COUNT(film.film_id) AS number_of_films_distributed
        FROM film
        JOIN distributor
        ON film.distributor_id = distributor.distributor_id
        GROUP BY distributor.distributor_id
        ORDER BY number_of_films_distributed DESC;  
    `);

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

const getMoviesByDistributor = (distributorId) => {
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
            ORDER BY film.release_date DESC, reporting_weekend.start_date DESC
        ) AS recent_film_entries
        WHERE row_num = 1;      
    `, [distributorId]);
};


const getReportingWeekendsByFilmId = (filmId) => {
    return pool.query(`
        SELECT 
            reporting_weekend.reporting_id,
            reporting_weekend.start_date,
            reporting_weekend.end_date
        FROM weekly_box_office
        JOIN reporting_weekend
            ON weekly_box_office.reporting_id = reporting_weekend.reporting_id
        WHERE weekly_box_office.film_id = $1;    
    `, [filmId]);
}

module.exports = {
    getReportingWeekends,
    getMovies,
    getMoviesByReportingWeekend,
    getMovieById,
    getMoviePerformanceById,
    getDistributors,
    getDistributorById,
    getMoviesByDistributor,
    getReportingWeekendsByFilmId
};