const boxOfficeModel = require("../models/boxOfficeModel");

const getReportingWeekends = async (req, res) => {

    try {

        const {reportingWeekendsAsc, reportingWeekendsDesc} = await boxOfficeModel.getReportingWeekends();

        let groupedWeekendsAsc = {};
        let groupedWeekendsDesc = {};

        const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ]

        //created the grouped weekends object for the weekends in ascending order
        for (const entry of reportingWeekendsAsc.rows) {
            const startDate = new Date(entry.start_date);
            const endDate = new Date(entry.end_date);

            const [startYear, startMonth] = [startDate.getFullYear(), months[startDate.getMonth()]];
            const [endYear, endMonth] = [endDate.getFullYear(), months[endDate.getMonth()]];

            //checking if either start or end year exists in our reportingWeekends object
            //if not add it as a new year entry
            if (!Object.hasOwn(groupedWeekendsAsc, startYear)) {
                groupedWeekendsAsc[startYear] = {};
            }

            if (!Object.hasOwn(groupedWeekendsAsc, endYear)) {
                groupedWeekendsAsc[endYear] = {};
            }

            //checking if the corresponding year contains the month entry
            //if not add it to the corresponding year as a new month entry
            if (!Object.hasOwn(groupedWeekendsAsc[startYear], startMonth)) {
                groupedWeekendsAsc[startYear][startMonth] = [];
            }

            if (!Object.hasOwn(groupedWeekendsAsc[endYear], endMonth)) {
                groupedWeekendsAsc[endYear][endMonth] = [];
            }

            //check if the start and end months OR start and end years are different
            //if they are different push both their entries into the same year-month array
            if (startYear != endYear || startMonth != endMonth) {
                groupedWeekendsAsc[startYear][startMonth].push(entry);
                groupedWeekendsAsc[endYear][endMonth].push(entry);
            
            //if they are the same then push only one entry and either
            //start or end date entry would work as they would reflect the same thing
            } else {
                groupedWeekendsAsc[startYear][startMonth].push(entry);
            }

        }


        //created the grouped weekends object for the weekends in descending order
        for (const entry of reportingWeekendsDesc.rows) {
            const startDate = new Date(entry.start_date);
            const endDate = new Date(entry.end_date);

            const [startYear, startMonth] = [startDate.getFullYear(), months[startDate.getMonth()]];
            const [endYear, endMonth] = [endDate.getFullYear(), months[endDate.getMonth()]];

            //checking if either start or end year exists in our reportingWeekends object
            //if not add it as a new year entry
            if (!Object.hasOwn(groupedWeekendsDesc, startYear)) {
                groupedWeekendsDesc[startYear] = {};
            }

            if (!Object.hasOwn(groupedWeekendsDesc, endYear)) {
                groupedWeekendsDesc[endYear] = {};
            }

            //checking if the corresponding year contains the month entry
            //if not add it to the corresponding year as a new month entry
            if (!Object.hasOwn(groupedWeekendsDesc[startYear], startMonth)) {
                groupedWeekendsDesc[startYear][startMonth] = [];
            }

            if (!Object.hasOwn(groupedWeekendsDesc[endYear], endMonth)) {
                groupedWeekendsDesc[endYear][endMonth] = [];
            }

            //check if the start and end months OR start and end years are different
            //if they are different push both their entries into the same year-month array
            if (startYear != endYear || startMonth != endMonth) {
                groupedWeekendsDesc[startYear][startMonth].push(entry);
                groupedWeekendsDesc[endYear][endMonth].push(entry);
            
            //if they are the same then push only one entry and either
            //start or end date entry would work as they would reflect the same thing
            } else {
                groupedWeekendsDesc[startYear][startMonth].push(entry);
            }

        }

        res.json({
            groupedWeekendsAsc: groupedWeekendsAsc,
            groupedWeekendsDesc: groupedWeekendsDesc
        });

    } catch(error) {

        console.error(error);
        res.status(500).json({ error: "Database query failed" });

    }

};

const getMovies = async (req, res) => {
    
    try {

        //collecting the search query and other filters
        //from the queries parameter in the request object
        const searchQuery = req.query.search;
        const language = req.query.language;
        const minGross = req.query.minGross;
        const maxGross = req.query.maxGross;

        //collecting sorting parameters from the request object
        const sortQuery = req.query.sort;

        const result = await boxOfficeModel.getMovies(searchQuery, language, minGross, maxGross, sortQuery);

        res.json(result.rows);

    } catch(error) {

        console.error(error);
        res.status(500).json({ error: "Database query failed" });

    }
};

const getLanguages = async (req, res) => {
    
    try {

        const result = await boxOfficeModel.getLanguages();

        res.json(result.rows);

    } catch(error) {

        console.error(error);
        res.status(500).json({ error: "Database query failed" });

    }
}

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

        //collecting the search and sort queries
        //from the queries parameter in the request object
        const searchQuery = req.query.search;
        const sortQuery = req.query.sort;

        const { distributors, movies } = await boxOfficeModel.getDistributors(searchQuery, sortQuery);

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

        //collecting the search and sort queries
        //from the queries parameter in the request object
        const searchQuery = req.query.search;
        const sortQuery = req.query.sort;

        const result = await boxOfficeModel.getMoviesByDistributor(distributorId, searchQuery, sortQuery);

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

        let groupedWeekends = {};

        const rawWeekends = result.rows;

        const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ]


        //created the grouped weekends object for the weekends
        for (const entry of rawWeekends) {
            const startDate = new Date(entry.start_date);
            const endDate = new Date(entry.end_date);

            const [startYear, startMonth] = [startDate.getFullYear(), months[startDate.getMonth()]];
            const [endYear, endMonth] = [endDate.getFullYear(), months[endDate.getMonth()]];

            //checking if either start or end year exists in our reportingWeekends object
            //if not add it as a new year entry
            if (!Object.hasOwn(groupedWeekends, startYear)) {
                groupedWeekends[startYear] = {};
            }

            if (!Object.hasOwn(groupedWeekends, endYear)) {
                groupedWeekends[endYear] = {};
            }

            //checking if the corresponding year contains the month entry
            //if not add it to the corresponding year as a new month entry
            if (!Object.hasOwn(groupedWeekends[startYear], startMonth)) {
                groupedWeekends[startYear][startMonth] = [];
            }

            if (!Object.hasOwn(groupedWeekends[endYear], endMonth)) {
                groupedWeekends[endYear][endMonth] = [];
            }

            //check if the start and end months OR start and end years are different
            //if they are different push both their entries into the same year-month array
            if (startYear != endYear || startMonth != endMonth) {
                groupedWeekends[startYear][startMonth].push(entry);
                groupedWeekends[endYear][endMonth].push(entry);
            
            //if they are the same then push only one entry and either
            //start or end date entry would work as they would reflect the same thing
            } else {
                groupedWeekends[startYear][startMonth].push(entry);
            }

        }

        res.json({
            rawWeekends: rawWeekends,
            groupedWeekends: groupedWeekends,
        });

    } catch(error) {

        console.error(error);
        res.status(500).json({ error: "Database query failed" });

    }

};

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