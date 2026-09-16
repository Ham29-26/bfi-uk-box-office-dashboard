const pool = require("./src/db/db");

async function populatePosters() {
    
    try {

        const result = await pool.query(`
            SELECT film_id, film_title
            FROM film
            WHERE film_poster_img_path IS NULL;
        `)

        const films = result.rows;

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
            

            if (matchingFilm && matchingFilm.poster_path) {
                const updateResult = await pool.query(`
                    UPDATE film
                    SET film_poster_img_path = $1
                    WHERE film_id = $2
                `, [matchingFilm.poster_path, film.film_id]);

                console.log("Rows updated:", updateResult.rowCount);
            }
        }        
        
    } catch (error) {

        console.error(error)

    }
}

populatePosters();