const boxOfficeModel = require("../models/boxOfficeModel");

const getReportingWeekends = (req, res) => {
    boxOfficeModel.getReportingWeekends()
        .then(result => {
            res.json(result.rows);
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: "Database query failed" });
        });
};

const getMovies = (req, res) => {
    boxOfficeModel.getMovies()
        .then(result => {
            res.json(result.rows);
        })
        .catch(error => {
            console.error(error);
            res.staus(500).json({ error: "Database query failed" });
        });
};

const getMoviesByReportingWeekend = (req, res) => {
    const reportingId = req.params.id;

    boxOfficeModel.getMoviesByReportingWeekend(reportingId)
        .then(result => {
            res.json(result.rows);
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error : "Database query failed" });
        });
};

const getMovieById = (req, res) => {
    const filmId = req.params.id;

    boxOfficeModel.getMovieById(filmId)
        .then(result => {
            res.json(result.rows);
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error : "Database query failed" });
        });
};

const getMoviePerformanceById = (req, res) => {
    const filmId = req.params.filmId;
    const reportingId = req.params.reportingId;

    boxOfficeModel.getMoviePerformanceById(filmId, reportingId)
        .then(result => {
            res.send(result.rows)
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error : "Database query failed" });
        });
};

// const getDistributors = (req, res) => {
//     boxOfficeModel.getDistributors()
//         .then(result => {
//             res.send(result.rows)
//         })
//         .catch(error => {
//             console.error(error);
//             res.status(500).json({ error: "Database query failed" });
//         });
// };

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

    }

}

const getDistributorById = (req, res) => {
    const distributorId = req.params.id;

    boxOfficeModel.getDistributorById(distributorId)
        .then(result => {
            res.send(result.rows)
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: "Database query failed" });
        });
};

const getMoviesByDistributor = (req, res) => {
    const distributorId = req.params.id;

    boxOfficeModel.getMoviesByDistributor(distributorId)
        .then(result => {
            res.send(result.rows)
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: "Database query failed" });
        });
};

const getReportingWeekendsByFilmId = (req, res) => {
    const filmId = req.params.filmId;

    boxOfficeModel.getReportingWeekendsByFilmId(filmId)
        .then(result => {
            res.send(result.rows)
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: "Database query failed" });
        });
};

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