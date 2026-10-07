const pool = require("./src/db/db");

//manual movie metadata insertion code
//comment out the automated method and run this
//by manually inserting the film title and film id
async function populateMovieMetadataManual() {
    
    try {

        const result = await pool.query(`
            SELECT film_id, film_title
            FROM film
            WHERE film_poster_img_path IS NULL
                AND release_date IS NULL
                AND synopsis IS NULL
                AND original_language IS NULL;
        `)

        const films = result.rows;

        if (films.length === 0) {
            console.log("All movie metadata is already populated.");
            return;
        }

        let rowsUpdated = 0;

        const response = await fetch(
            `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent("Manually Input Film Title")}&primary_release_year=2026`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`
                }
            }
        );

        console.log("TMDB HTTP status:", response.status);

        const data = await response.json();   

        //TESTING
        // console.log("Movie metadata", data);
        
        console.log("Movie Title: ", data.results[0].title);
        console.log("Release Date: ", data.results[0].release_date);
        console.log("Synopsis: " + data.results[0].overview);
        console.log("Original Language: " + data.results[0].original_language);


        //MANUAL ADDITION
        if (data.results) {
            const posterPath = data.results[0].poster_path || null;
            const releaseDate = data.results[0].release_date || null;
            const synopsis = data.results[0].overview?.trim() || null;
            const originalLanguage = data.results[0].original_language || null;

            const updateResult = await pool.query(`
                UPDATE film
                SET film_poster_img_path = $1,
                    release_date = $2,
                    synopsis = $3,
                    original_language = $4
                WHERE film_id = $5;
            `, [
                posterPath, 
                releaseDate, 
                synopsis, 
                originalLanguage,
                ManuallyInputFilmId
            ]);

            rowsUpdated += updateResult.rowCount;
        }
        
        console.log(`Rows updated: ${rowsUpdated}`);
        
    } catch (error) {

        console.error(error)

    }
}

populateMovieMetadataManual()


//node manual_populate_movie_metadata.js