const express = require("express");
const boxOfficeController = require("../controllers/boxOfficeController");

const router = express.Router()

router.get(
    "/reporting-weekends", 
    boxOfficeController.getReportingWeekends
);

router.get(
    "/movies",
    boxOfficeController.getMovies
);

router.get(
    "/reporting-weekends/:id/movies",
    boxOfficeController.getMoviesByReportingWeekend
);

router.get(
    "/movies/:id",
    boxOfficeController.getMovieById
);

router.get(
    "/movies/:filmId/box-office/:reportingId",
    boxOfficeController.getMoviePerformanceUpToWeekend
);

router.get(
    "/distributors",
    boxOfficeController.getDistributors
);

router.get(
    "/distributors/:id",
    boxOfficeController.getDistributorById
);

router.get(
    "/distributors/:id/movies",
    boxOfficeController.getMoviesByDistributor
);

router.get(
    "/movies/:filmId/reporting-weekends",
    boxOfficeController.getReportingWeekendsByFilmId
);

module.exports = router;