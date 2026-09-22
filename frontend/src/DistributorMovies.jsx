import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { Link } from "react-router-dom";
import ISO6391 from "iso-639-1"

function DistributorMovies() {

    const params = useParams();
    const distributorId = params.distributorId;

    const [movies, setMovies] = useState([]);

    useEffect(() => {

        async function getMoviesByDistributor() {
            
            try {

                const response = await fetch(`http://localhost:3000/api/distributors/${distributorId}/movies`);

                const data = await response.json();

                setMovies(data);

            } catch(error) {
                
                console.error(error);
                
            }

        }

        getMoviesByDistributor();

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
        <Link 
            to={"/distributors"}
            className="distributor-back-link"
        >
            ← Back to Distributors
        </Link>

        <h1 className="page-title">
            Movies distributed by {movies[0]?.distributor_name}
        </h1>

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

                <p>Release Date: {dateFormatter(movie.release_date)}</p>

                <p>Country of Origin: {movie.country_of_origin}</p>

                <p>Original Language: {ISO6391.getName(movie.original_language)} {movie.original_language !== "en" ? ISO6391.getNativeName(movie.original_language) : ""}</p>

                <p>Distributor: {movie.distributor_name}</p>

                <p>Synopsis: {movie.synopsis}</p>

                <p>Total Gross (as of {dateFormatter(movie.end_date)}): £ {Number(movie.total_gross_to_date).toLocaleString()}</p>

                <p className="movie-details-link">
                Click here to view more details
                </p>
            </aside>
            </div>
        </Link>
        ))}
        </>
    );

}

export default DistributorMovies