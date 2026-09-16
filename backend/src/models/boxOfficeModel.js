const pool = require("../db/db");

const getReportingWeekends = () => {
    return pool.query(`
        SELECT 
            reporting_id, 
            start_date::TEXT AS start_date, 
            end_date::TEXT AS end_date
        FROM reporting_weekend
        ORDER BY start_date
    `);
};

const getMoviesByReportingWeekend = (reportingId) => {
    return pool.query(`
        SELECT
            weekly_box_office.film_rank,
            film.film_title,
            film.country_of_origin,
            film.film_poster_img_path,
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
            film_title,
            film_poster_img_path,
            country_of_origin, 
            distributor_name
        FROM film

        JOIN distributor 
        ON distributor.distributor_id = film.distributor_id

        WHERE film.film_id = $1;   
    `, [filmId]);
};

const getMoviePerformanceById = (filmId) => {
    return pool.query(`
        SELECT
            weekly_box_office.film_rank,
            film.film_title,
            film.film_poster_img_path,
            weekly_box_office.weekend_gross,
            weekly_box_office.percent_change,
            weekly_box_office.weeks_on_release,
            weekly_box_office.number_of_cinemas,
            weekly_box_office.site_average,
            weekly_box_office.total_gross_to_date,
            reporting_weekend.start_date,
            reporting_weekend.end_date
        FROM weekly_box_office
        JOIN film
            ON weekly_box_office.film_id = film.film_id
        JOIN reporting_weekend
            ON weekly_box_office.reporting_id = reporting_weekend.reporting_id
        WHERE weekly_box_office.film_id = $1
        ORDER BY film_rank, start_date;    
    `, [filmId]);
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
        SELECT film_title, film_poster_img_path, country_of_origin, distributor_name
        FROM film
        JOIN distributor
        ON film.distributor_id = distributor.distributor_id
        WHERE film.distributor_id = $1;    
    `, [distributorId]);
};

module.exports = {
    getReportingWeekends,
    getMoviesByReportingWeekend,
    getMovieById,
    getMoviePerformanceById,
    getDistributorById,
    getMoviesByDistributor
};