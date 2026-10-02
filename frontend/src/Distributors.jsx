import { useEffect } from "react"
import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom";

function Distributors() {

    //creating a state to store all the distributors we have
    const [distributors, setDistributors] = useState([]);

    //create state to store the search query params
    const [searchQuery, setSearchQuery] = useState("");

    //capturing the search query params from the url
    const [searchParams, setSearchParams] = useSearchParams();
    const searchQueryFromURL = searchParams.get("search");

    //capturing sort params from the url
    const sortQueryFromURL = searchParams.get("sort");

    const [currentPage, setCurrentPage] = useState(1);
    const distributorsPerPage = 5;

    useEffect(() => {

        async function getDistributors() {
            
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
                    ? `http://localhost:3000/api/distributors?${queryString}`
                    : "http://localhost:3000/api/distributors";

                const response = await fetch(url);

                const data = await response.json();               

                setDistributors(data);

            } catch(error) {

                console.error(error);

            }

        }

        getDistributors();

    }, [searchQueryFromURL, sortQueryFromURL]);


    //create a another useEffect hook to synchronize the textbox with the URL
    //and so it doesn't reset to its initial empty state after a refresh
    useEffect(() => {
        setSearchQuery(searchQueryFromURL || "");
    }, [searchQueryFromURL]);


    //implementing pagenation
    //calculating the current pages range
    const startIndex = (currentPage - 1) * distributorsPerPage;
    const endIndex = startIndex + distributorsPerPage;

    const currentDistributors = distributors.slice(startIndex, endIndex);

    const totalPages = Math.ceil(distributors.length / distributorsPerPage);

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

    if (sortQueryFromURL === "name-asc") {
        resultMessages.push(
            "Sort applied: Distributor name — A to Z"
        );
    }

    if (sortQueryFromURL === "name-desc") {
        resultMessages.push(
            "Sort applied: Distributor name — Z to A"
        );
    }

    if (sortQueryFromURL === "movies-desc") {
        resultMessages.push(
            "Sort applied: Number of movies — Highest first"
        );
    }

    if (sortQueryFromURL === "movies-asc") {
        resultMessages.push(
            "Sort applied: Number of movies — Lowest first"
        );
    }

    if (distributors.length === 0) {
        resultMessages.push(
            "No matching results",
            "Please try to search for another distributor."
        )
    }

    const resultCount =
        distributors.length === 1
            ? "Showing 1 result"
            : `Showing ${distributors.length} results`

    
    if (distributors.length === 0) {

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
                <p>Showing all distributors ({distributors.length} distributors)</p>
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


    return(
        <>
        <h1 className="page-title">Distributors</h1>

        <search className="search-container">
            <input 
                type="text" 
                id="search-bar" 
                placeholder="Search for a distributor" 
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
                    key="name-asc"
                    value="name-asc"
                >
                    Distributor name — A to Z
                </option>

                <option
                    key="name-desc"
                    value="name-desc"
                >
                    Distributor name — Z to A
                </option>

                <option
                    key="movies-desc"
                    value="movies-desc"
                >
                    Number of movies — Highest first
                </option>

                <option
                    key="movies-asc"
                    value="movies-asc"
                >
                    Number of movies — Lowest first
                </option>
                
            </select>

        </div>          

        {resultsInfo}

        {currentDistributors.map(distributor => (
            <Link
                key={distributor.distributor_id} 
                className="distributor-card-link"
                to={`/distributors/${distributor.distributor_id}/movies`}
            >
                <div>
                    <h2 className="distributor-name">
                        {distributor.distributor_name} ({distributor.number_of_films_distributed} films)
                    </h2>

                    <div className="distributor-film-posters">
                        {distributor.preview_movies
                            .slice(0,6)
                            .map(movie => (
                                <figure key={movie.film_id}>
                                    <img 
                                        src={`https://image.tmdb.org/t/p/w500${movie.film_poster_img_path}`}
                                        alt={`${movie.film_title} Film Poster`}
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

        <div className="pagination">

            <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
            >
                ←
            </button>

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

            <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                →
            </button>

        </div>
        </>
    );

}

export default Distributors