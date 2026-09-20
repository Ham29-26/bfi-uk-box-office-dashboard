const pool = require("./src/db/db");
const ISO6391 = require("iso-639-1");

console.log(ISO6391.getName("ml"));
console.log(ISO6391.getName("te"));
console.log(ISO6391.getName("es"));
console.log(ISO6391.getName("hi"));
console.log(ISO6391.getName("en"));


async function languageTest() {
    
    try {

        const result = await pool.query(`
            SELECT film_id, film_title
            FROM film
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
            
            console.log(data);
            

            const matchingFilm = data.results.find(
                filmResult => filmResult.title.toLowerCase() === film.film_title.toLowerCase()
            );

            if (matchingFilm) {
                console.log("Film title: ", matchingFilm.title);
                console.log("Original language:", matchingFilm.original_language);
                console.log("Language text: ", ISO6391.getName(matchingFilm.original_language));
                console.log("Native Language Text: ", ISO6391.getNativeName(matchingFilm.original_language));
            }

        }
        
    } catch (error) {

        console.error(error)

    }
}

// languageTest();



async function distributorsTest() {
    
    try {

        // const result = await fetch("http://localhost:3000/api/distributors");

        // const distributors = await result.json();

        // console.log(distributors);

        const movieId = 936075;

        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`
                }
            }
        );

        const movie = await response.json();

        console.log("Matching movie description: ", movie);


        // for (const distributor of distributors) {
        //     console.log("Distributor from database: ", distributor);

        //     const response = await fetch(
        //         `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(film.film_title)}&primary_release_year=2026`,
        //         {
        //             headers: {
        //                 Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`
        //             }
        //         }
        //     );
            
        // }

    } catch(error) {

        console.error(error);

    }

}

distributorsTest();