const pool = require("./src/db/db");

async function populateMovieMetadata() {
    
    try {

        const result = await pool.query(`
            SELECT film_id, film_title
            FROM film
            WHERE film_poster_img_path IS NULL
                OR release_date IS NULL
                OR synopsis IS NULL
                OR original_language IS NULL;
        `)

        const films = result.rows;

        if (films.length === 0) {
            console.log("All movie metadata is already populated.");
            return;
        }

        let rowsUpdated = 0;

        for (const film of films) {
            console.log("Film from database", film);

            const response = await fetch(
                `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(film.film_title)}&primary_release_year=2026`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`
                    }
                }
            );

            console.log("TMDB HTTP status:", response.status);

            const data = await response.json();   

            const matchingFilm = data.results.find(
                filmResult => filmResult.title.toLowerCase() === film.film_title.toLowerCase()
            );

            console.log("Matching films:", matchingFilm);
            

            if (matchingFilm) {
                const updateResult = await pool.query(`
                    UPDATE film
                    SET film_poster_img_path = $1,
                        release_date = $2,
                        synopsis = $3,
                        original_language = $4
                    WHERE film_id = $5;
                `, [
                    matchingFilm.poster_path, 
                    matchingFilm.release_date, 
                    matchingFilm.overview, 
                    matchingFilm.original_language,
                    film.film_id
                ]);

                rowsUpdated += updateResult.rowCount;
            }

        }
        
        console.log(`Rows updated: ${rowsUpdated}`);
        
    } catch (error) {

        console.error(error)

    }
}

populateMovieMetadata();

//node populate_movie_metadata.js