import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import ISO6391 from "iso-639-1"

function MovieDetails() {

    //capturing the film and reporting IDs from the URL params
    const params = useParams();
    const filmId = params.filmId
    const reportingId = params.reportingId

    const [weekends, setWeekends] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState({});

    const navigate = useNavigate();
    
    //run API to retrieve reporting weekends for the selected movie 
    //from the database which will be used 
    //to populate the reporting weekend dropbox 
    useEffect(() => {

        async function getMovieReportingWeeekends() {
            
            try {

                const response = await fetch(`http://localhost:3000/api/movies/${filmId}/reporting-weekends`);

                const data = await response.json();

                console.log(data);     

                setWeekends(data);

            } catch(error) {

                console.error(error);

            }

        }

        getMovieReportingWeeekends();

    }, []);
    
    //run API call to retrieve all the details about the selected movie
    //for the selected weekend
    useEffect(() => {

        async function getMovieDetails() {
            
            try {

                const response = await fetch(`http://localhost:3000/api/movies/${filmId}/box-office/${reportingId}`);

                const data = await response.json();

                setSelectedMovie(data[0]);

            } catch(error) {

                console.error(error);

            }

        }

        getMovieDetails();

    }, [filmId, reportingId]);


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

    const singleDateFormatter = (strDate) => {
        const date = new Date(strDate)

        return date.getDate() + " " + months[date.getMonth()] + ", " + date.getFullYear();
    }

    const doubleDateFormatter = (strStartDate, strEndDate) => {
        const startDate = new Date(strStartDate)
        const endDate = new Date(strEndDate)

        //if the start and end date months are different specify both month names
        if (startDate.getMonth() != endDate.getMonth()) {
            return startDate.getDate() 
            + " " + months[startDate.getMonth()] 
            + " – " + endDate.getDate() 
            + " " + months[endDate.getMonth()]
        }

        //if the start and end date months are the same specify only one month name
        return startDate.getDate() + " – " + endDate.getDate() + " " + months[startDate.getMonth()]
    }


    return (
        <>
        <p>Movie Details</p>

        <select 
        className="weekend-selector"
        value={reportingId}
        onChange={(event) => {
            navigate(`/movies/${filmId}/box-office/${event.target.value}`)
        }}
        >
            {weekends.map(weekend =>
            <option 
            key={weekend.reporting_id}
            value={weekend.reporting_id}>
            {doubleDateFormatter(weekend.start_date, weekend.end_date)}
            </option>
            )}
        </select>

        <div className="movie-card" key={selectedMovie.film_id}>
            <img 
                src={`https://image.tmdb.org/t/p/w500${selectedMovie.film_poster_img_path}`}
                alt={`${selectedMovie.film_title?.replace(" ", "_")}_film_poster`}
            />

            <aside>
                <h2>{selectedMovie.film_title}</h2>

                <p>Release Date: {singleDateFormatter(selectedMovie.release_date)}</p>

                <p>Country of Origin: {selectedMovie.country_of_origin}</p>

                <p>Original Language: {ISO6391.getName(selectedMovie.original_language)} {selectedMovie.original_language !== "en" ? ISO6391.getNativeName(selectedMovie.original_language) : ""}</p>

                <p>Distributor: {selectedMovie.distributor_name}</p>

                <p>Synopsis: {selectedMovie.synopsis}</p>

                <p>Total Gross (as of {singleDateFormatter(selectedMovie.end_date)}): £ {Number(selectedMovie.total_gross_to_date).toLocaleString()}</p>

                <p>% Change on last week: {selectedMovie.percent_change}</p>

                <p>Weeks on release: {selectedMovie.weeks_on_release}</p>

                <p>Number of cinemas: {selectedMovie.number_of_cinemas}</p>

                <p>Site Average: £ {Number(selectedMovie.site_average).toLocaleString()}</p>
            </aside>
            </div>
        </>
    );

}


export default MovieDetails