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

        // Fetch the exact movie using its TMDB ID in case we are following this approach
        // const tmdbMovieId = 1321666;
        //         const response = await fetch(
        //     `https://api.themoviedb.org/3/movie/${tmdbMovieId}`,
        //     {
        //         headers: {
        //             Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`
        //         }
        //     }
        // );

        // if (movie.id !== tmdbMovieId) {
        //     throw new Error("TMDB returned an unexpected movie ID.");
        // }

        const response = await fetch(
            `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent("BTS WORLD TOUR [ARIRANG] in Buenos Aires")}&primary_release_year=2026`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`
                }
            }
        );

        console.log("TMDB HTTP status:", response.status);

        if (!response.ok) {
            throw new Error(`TMDB request failed: ${response.status}`);
        }

        const data = await response.json();   

        const movie = data.results?.[0] || data;

        //TESTING
        console.log(`Movie Title: ${movie.title || "No matching film found"}`);
        console.log(`Release Date: ${movie.release_date || "No matching film found"}`);
        console.log(`Synopsis: ${movie.overview?.trim() || "No matching film found"}`);
        console.log(`Original Language: ${movie.original_language || "No matching film found"}`);

        
        let rowsUpdated = 0;

        //MANUAL ADDITION
        if (movie.id && movie.title) {
            const posterPath = movie.poster_path || null;
            const releaseDate = movie.release_date || null;
            const synopsis = movie.overview?.trim() || null;
            const originalLanguage = movie.original_language || null;

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
                265
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