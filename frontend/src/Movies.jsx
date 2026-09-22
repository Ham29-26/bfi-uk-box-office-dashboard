import { useState } from "react"
import { useEffect } from "react"
import ISO6391 from "iso-639-1"
import { Link } from "react-router-dom";

function Movies() {

    const [movies, setMovies] = useState([]);

    //run API call to retrieve all the movies in the database
    useEffect(() => {

        async function getMovies() {

            try {

                const response = await fetch("http://localhost:3000/api/movies");

                console.log("HTTP status for API movies retrieval: ", response.status);

                const data = await response.json();

                console.log(data);

                setMovies(data);

            } catch(error) {

                console.error(error);

            }

        }

        getMovies();

    }, []);


    //creating a date formatter
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

    const dateFormatter = (strDate) => {
        const date = new Date(strDate)
        const day = String(date.getDate()).padStart(2, "0")

        return day + " " + months[date.getMonth()] + ", " + date.getFullYear();
    }


    return (
        <>
        <h1 className="page-title">Movies</h1>

        {movies.map(movie => (
            <Link
            key={movie.film_id} 
            className="movie-card-link"
            to={`/movies/${movie.film_id}/box-office/${movie.reporting_id}`}
            >

            <div className="movie-card movie-card-detailed">
            <img 
                src={`https://image.tmdb.org/t/p/w500${movie.film_poster_img_path}`}
                alt={`${movie.film_title.replace(' ', '_')}_film_poster`}
            />

            <aside>
                <h2>{movie.film_title}</h2>

                <p><strong>Release Date:</strong> {dateFormatter(movie.release_date)}</p>

                <p><strong>Country of Origin:</strong> {movie.country_of_origin}</p>

                <p><strong>Original Language:</strong> {ISO6391.getName(movie.original_language)} {movie.original_language !== "en" ? ISO6391.getNativeName(movie.original_language) : ""}</p>

                <p><strong>Distributor:</strong> {movie.distributor_name}</p>

                <p className="synopsis"><strong>Synopsis:</strong> {movie.synopsis}</p>

                <p><strong>Total Gross (as of {dateFormatter(movie.end_date)}):</strong> £ {Number(movie.total_gross_to_date).toLocaleString()}</p>

                <p className="movie-details-link">
                Click here to view more details
                </p>
            </aside>
            </div>
        </Link>
        ))}
        </>
    )

}

export default Movies