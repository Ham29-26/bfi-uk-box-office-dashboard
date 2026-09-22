const boxOfficeModel = require("../models/boxOfficeModel");

const getReportingWeekends = async (req, res) => {

    try {

        const result = await boxOfficeModel.getReportingWeekends();

        res.json(result.rows);

    } catch(error) {

        console.error(error);
        res.status(500).json({ error: "Database query failed" });

    }

};

const getMovies = async (req, res) => {
    
    try {

        const result = await boxOfficeModel.getMovies();

        res.json(result.rows);

    } catch(error) {

        console.error(error);
        res.status(500).json({ error: "Database query failed" });

    }
};

const getMoviesByReportingWeekend = async (req, res) => {

    try {

        const reportingId = req.params.id;

        const result = await boxOfficeModel.getMoviesByReportingWeekend(reportingId);

        res.json(result.rows);

    } catch(error) {

        console.error(error);
        res.status(500).json({ error: "Database query failed" });

    }

};

const getMovieById = async (req, res) => {

    try {

        const filmId = req.params.id;

        const result = await boxOfficeModel.getMovieById(filmId);

        res.json(result.rows);

    } catch(error) {

        console.error(error);
        res.status(500).json({ error: "Database query failed" });

    }

};

const getMoviePerformanceUpToWeekend = async (req, res) => {

    try {

        const filmId = req.params.filmId;
        const reportingId = req.params.reportingId;

        const result = await boxOfficeModel.getMoviePerformanceUpToWeekend(filmId, reportingId);

        res.json(result.rows);

    } catch(error) {

        console.error(error);
        res.status(500).json({ error: "Database query failed" });

    }

};

const getDistributors = async (req, res) => {

    try {

        const { distributors, movies } = await boxOfficeModel.getDistributors();

        let distributorsMetaData = [];
        let previewMovies = [];

        for (const distributor of distributors.rows) {
            
            distributorsMetaData.push(
                {
                    "distributor_id" : distributor.distributor_id,
                    "distributor_name" : distributor.distributor_name,
                    "number_of_films_distributed" : distributor.number_of_films_distributed,
                    "preview_movies" : previewMovies
                }
            )

            for (const movie of movies.rows) {
                if (distributor.distributor_id === movie.distributor_id) {
                    previewMovies.push(
                        {
                            "film_id" : movie.film_id,
                            "film_title" : movie.film_title,
                            "film_poster_img_path" : movie.film_poster_img_path
                        }
                    )
                }
            }

            previewMovies = []
        }


        res.send(distributorsMetaData);

    } catch(error) {

        console.error(error);
        res.status(500).json({ error: "Database query failed" });

    }

}

const getDistributorById = async (req, res) => {

    try {

        const distributorId = req.params.id;

        const result = await boxOfficeModel.getDistributorById(distributorId);

        res.json(result.rows);

    } catch(error) {

        console.error(error);
        res.status(500).json({ error: "Database query failed" });

    }

};

const getMoviesByDistributor = async (req, res) => {

    try {

        const distributorId = req.params.id;

        const result = await boxOfficeModel.getMoviesByDistributor(distributorId);

        res.json(result.rows);

    } catch(error) {

        console.error(error);
        res.status(500).json({ error: "Database query failed" });

    }

};

const getReportingWeekendsByFilmId = async (req, res) => {

    try {

        const filmId = req.params.filmId;

        const result = await boxOfficeModel.getReportingWeekendsByFilmId(filmId);

        res.json(result.rows);

    } catch(error) {

        console.error(error);
        res.status(500).json({ error: "Database query failed" });

    }

};

module.exports = {
    getReportingWeekends,
    getMovies,
    getMoviesByReportingWeekend,
    getMovieById,
    getMoviePerformanceUpToWeekend,
    getDistributors,
    getDistributorById,
    getMoviesByDistributor,
    getReportingWeekendsByFilmId
};