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
    const filmId = req.params.id;

    boxOfficeModel.getMoviePerformanceById(filmId)
        .then(result => {
            res.send(result.rows)
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error : "Database query failed" });
        });
};

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

module.exports = {
    getReportingWeekends,
    getMoviesByReportingWeekend,
    getMovieById,
    getMoviePerformanceById,
    getDistributorById,
    getMoviesByDistributor
};