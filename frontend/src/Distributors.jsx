import { useEffect } from "react"
import { useState } from "react"
import { Link } from "react-router-dom";

function Distributors() {

    const [distributors, setDistributors] = useState([]);

    useEffect(() => {

        async function getDistributors() {
            
            try {

                const response = await fetch("http://localhost:3000/api/distributors");

                const data = await response.json();               

                setDistributors(data);

            } catch(error) {

                console.error(error);

            }

        }

        getDistributors();

    }, []);


    return(
        <>
        <p>Distributors</p>

        {distributors.map(distributor => (
            <Link
                key={distributor.distributor_id} 
                className="distributor-card-link"
                to={`/distributors/${distributor.distributor_id}/movies`}
            >
                <div>
                    <p>{distributor.distributor_name} ({distributor.number_of_films_distributed} films)</p>

                    <div className="distributor-film-posters">
                        {distributor.preview_movies
                            .slice(0,6)
                            .map(movie => (
                                <figure key={movie.film_id}>
                                    <img 
                                        src={`https://image.tmdb.org/t/p/w500${movie.film_poster_img_path}`}
                                        alt={`${movie.film_title.replace(" ", "_")}_film_poster`}
                                    />
                                    
                                    <figcaption>
                                        {movie.film_title}
                                    </figcaption>
                                </figure>
                            ))
                        }
                    </div>

                    <p className="distributor-details-link">
                        See all films...
                    </p>
                </div>
            </Link>
        ))}
        </>
    );

}

export default Distributors