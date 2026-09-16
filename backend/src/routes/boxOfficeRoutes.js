const express = require("express");
const boxOfficeController = require("../controllers/boxOfficeController");

const router = express.Router()

router.get(
    "/reporting-weekends", 
    boxOfficeController.getReportingWeekends
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
    "/movies/:id/box-office",
    boxOfficeController.getMoviePerformanceById
);

router.get(
    "/distributors/:id",
    boxOfficeController.getDistributorById
);

router.get(
    "/distributors/:id/movies",
    boxOfficeController.getMoviesByDistributor
);

module.exports = router;