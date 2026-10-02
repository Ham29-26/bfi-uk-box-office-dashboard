import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { Link, useSearchParams } from "react-router-dom";
import ISO6391 from "iso-639-1";

//creating a dictionary of fall back languages for 
//languages that have not been identifed by the ISO package
const languageFallbacks = {
    cn: {
        name: "Cantonese",
        nativeName: "粵語"
    }
}

function DistributorMovies() {

    const params = useParams();
    const distributorId = params.distributorId;

    const [movies, setMovies] = useState([]);

    //create state to store the search query params
    const [searchQuery, setSearchQuery] = useState("");

    //capturing the search query params from the url
    const [searchParams, setSearchParams] = useSearchParams();
    const searchQueryFromURL = searchParams.get("search");

    //capturing sort params from the url
    const sortQueryFromURL = searchParams.get("sort");

    //creating a state to store the current page of the movie the user 
    //is viewing and total number of movies that will be shown in a page
    const[currentPage, setCurrentPage] = useState(1);
    const moviesPerPage = 10;

    useEffect(() => {

        async function getMoviesByDistributor() {
            
            try {

                //collecting the search and other filter, sort parameters if there are any
                const params = new URLSearchParams();

                if (searchQueryFromURL) {
                    params.set("search", searchQueryFromURL);
                }

                if (sortQueryFromURL) {
                    params.set("sort", sortQueryFromURL);
                }

                const queryString = params.toString();

                const url = queryString
                    ? `http://localhost:3000/api/distributors/${distributorId}/movies?${queryString}`
                    : `http://localhost:3000/api/distributors/${distributorId}/movies`;

                const response = await fetch(url);

                const data = await response.json();

                setMovies(data);

            } catch(error) {
                
                console.error(error);
                
            }

        }

        getMoviesByDistributor();

    }, [searchQueryFromURL, sortQueryFromURL]);


    //create a another useEffect hook to synchronize the textbox with the URL
    //and so it doesn't reset to its initial empty state after a refresh
    useEffect(() => {
        setSearchQuery(searchQueryFromURL || "");
    }, [searchQueryFromURL]);

    
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


    //implementing pagenation
    //calculating the current pages range
    const startIndex = (currentPage - 1) * moviesPerPage;
    const endIndex = startIndex + moviesPerPage;

    const currentMovies = movies.slice(startIndex, endIndex);

    const totalPages = Math.ceil(movies.length / moviesPerPage);    

    let pageNumbers = [];

    if (totalPages <= 5) {
        for (let page = 1; page <= totalPages; page++) {
            pageNumbers.push(page);
        }
    }

    if (totalPages > 5 && currentPage <= 3) {
        pageNumbers = [1, 2, 3, "...", totalPages];
    }

    if (totalPages > 5 && currentPage > 3 && currentPage < totalPages - 2) {
        pageNumbers = [
            1,
            "...",
            currentPage - 1,
            currentPage,
            currentPage + 1,
            "...",
            totalPages
        ];
    }

    if (totalPages > 5 && currentPage >= totalPages - 2) {
        pageNumbers = [
            1,
            "...",
            totalPages - 2,
            totalPages - 1,
            totalPages
        ];
    }    


    //creating a variable to store the search results to be displayed if there is any
    let resultsInfo;

    const resultMessages = [];

    if (searchQueryFromURL) {
        resultMessages.push(
            `Search results for "${searchQueryFromURL}"`
        );
    }

    if (sortQueryFromURL === "title-asc") {
        resultMessages.push(
            "Sort applied: Film title — A to Z"
        );
    }

    if (sortQueryFromURL === "title-desc") {
        resultMessages.push(
            "Sort applied: Film title — Z to A"
        );
    }

    if (sortQueryFromURL === "release-desc") {
        resultMessages.push(
            "Sort applied: Release date — Newest first"
        );
    }

    if (sortQueryFromURL === "release-asc") {
        resultMessages.push(
            "Sort applied: Release date — Oldest first"
        );
    }

    if (sortQueryFromURL === "gross-desc") {
        resultMessages.push(
            "Sort applied: Total gross — Highest first"
        );
    }

    if (sortQueryFromURL === "gross-asc") {
        resultMessages.push(
            "Sort applied: Total gross — Lowest first"
        );
    }    

    if (movies.length === 0) {
        resultMessages.push(
            "No matching results",
            "Try adjusting or removing your filters."
        )
    }    

    const resultCount =
        movies.length === 1
            ? "Showing 1 result"
            : `Showing ${movies.length} results`

    
    if (movies.length === 0) {

        resultsInfo = (
            <div className="no-results">

                {resultMessages.map((message, index) => (
                    <p key={index}>{message}</p>
                ))}

            </div>
        );

    } else if (resultMessages.length === 0) {

        resultsInfo = (
            <div className="search-results">
                <p>Showing all movies ({movies.length} films)</p>
            </div>
        )
    
    } else {

        resultsInfo = (
            <div className="search-results">

                {resultMessages.map((message, index) => (
                    <p key={index}>{message}</p>
                ))}

                <p>{resultCount}</p>

            </div>
        );

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

        <search className="search-container">
            <input 
                type="text" 
                id="search-bar" 
                placeholder="Search for a movie" 
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
            />

            <div className="search-buttons">
                <button
                    className="search-button"
                    onClick={() => {
                            setCurrentPage(1)

                            const currentSearchParams = new URLSearchParams(searchParams);

                            if (searchQuery) {
                                currentSearchParams.set("search", searchQuery);
                            } 

                            setSearchParams(currentSearchParams);
                        }} 
                >
                    Search
                </button>

                <button
                    className="clear-search-button"
                    onClick={() => {
                        setCurrentPage(1)

                        const currentSearchParams = new URLSearchParams(searchParams);

                        currentSearchParams.delete("search");

                        setSearchParams(currentSearchParams);
                        setSearchQuery("")
                    }}
                >
                    Clear Search
                </button>
            </div>

        </search>

        <div className="sort-container">

            <label htmlFor="sort-selector">Sort by:</label>

            <select
                id="sort-selector" 
                className="sort-selector"
                onChange={(event) => {
                    setCurrentPage(1);

                    const sortQuery = event.target.value;

                    const currentSearchParams = new URLSearchParams(searchParams);

                    if (sortQuery) {
                        currentSearchParams.set("sort", sortQuery);
                    } else {
                        currentSearchParams.delete("sort");
                    }

                    setSearchParams(currentSearchParams);
                }}
                value={sortQueryFromURL || ""}
            >

                <option
                    value=""
                >
                    No sort applied
                </option>

                <option
                    key="title-asc"
                    value="title-asc"
                >
                    Film title — A to Z
                </option>

                <option
                    key="title-desc"
                    value="title-desc"
                >
                    Film title — Z to A
                </option>

                <option
                    key="release-desc"
                    value="release-desc"
                >
                    Release date — Newest first
                </option>

                <option
                    key="release-asc"
                    value="release-asc"
                >
                    Release date — Oldest first
                </option>

                <option
                    key="gross-desc"
                    value="gross-desc"
                >
                    Total gross — Highest first
                </option>

                <option
                    key="gross-asc"
                    value="gross-asc"
                >
                    Total gross — Lowest first
                </option>
                
            </select>

        </div>          

        {resultsInfo}      

        {currentMovies.map(movie => {

            const languageCode = movie.original_language;

            const languageName = 
                ISO6391.getName(languageCode) || 
                languageFallbacks[languageCode]?.name ||
                languageCode;

            const nativeName = 
                ISO6391.getNativeName(languageCode) || 
                languageFallbacks[languageCode]?.nativeName
                languageCode;
                

            return (
                <Link
                    key={movie.film_id} 
                    className="movie-card-link"
                    to={`/movies/${movie.film_id}/box-office/${movie.reporting_id}`}
                >

                    <div className="movie-card movie-card-detailed">
                    <img 
                        src={`https://image.tmdb.org/t/p/w500${movie.film_poster_img_path}`}
                        alt={`${movie.film_title} Film Poster`}
                    />

                    <aside>
                        <h2>{movie.film_title}</h2>

                        <p>
                            <strong>Release Date:</strong>{" "}
                            {movie.release_date 
                                ? dateFormatter(movie.release_date)
                                : "Release date information is currently unavailable."}
                        </p>

                        <p>Country of Origin: {movie.country_of_origin}</p>

                        <p>
                            <strong>Original Language:</strong>{" "} 
                            {movie.original_language
                                ? `${languageName} ${languageCode !== "en" ? `(${nativeName})` : ""}` 
                                : "Language information is currently unavailable."}
                        </p>

                        <p>Distributor: {movie.distributor_name}</p>

                        <p>Synopsis: {movie.synopsis || "No synopsis is currently available for this title."}</p>

                        <p>Total Gross (as of {dateFormatter(movie.end_date)}): £ {Number(movie.total_gross_to_date).toLocaleString()}</p>

                        <p className="movie-details-link">
                        Click here to view more details
                        </p>
                    </aside>
                    </div>
                </Link>
            );

        })}

        <div className="pagination">

            {totalPages > 5 && (
                <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    ←
                </button>
            )}

            {pageNumbers.map((page, index) => (
                page === "..."
                    ? <span key={index}>...</span>
                    : (
                        <button
                            key={index}
                            onClick={() => setCurrentPage(page)}
                        >
                            {page}
                        </button>
                    )
            ))}

            {totalPages > 5 && (
                <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    →
                </button>
            )}

        </div>    
        </>
    );

}

export default DistributorMovies