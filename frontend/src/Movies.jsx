import { useState } from "react"
import { useEffect } from "react"
import ISO6391 from "iso-639-1"
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//creating a dictionary of fall back languages for 
//languages that have not been identifed by the ISO package
const languageFallbacks = {
    cn: {
        name: "Cantonese",
        nativeName: "粵語"
    }
}

function Movies() {

    //create a state to store the movie results
    const [movies, setMovies] = useState([]);

    //create a state to store the highest total gross figure
    //to be displayed on our slider
    const [sliderMaxGross, setSliderMaxGross] = useState(null);

    //create a state to store all the languages
    const [languages, setLanguages] = useState([]);

    //create state to store the search query params
    const [searchQuery, setSearchQuery] = useState("");

    //create state to store the min and max gross values provided by the user
    const [minGross, setMinGross] = useState(0);
    const [maxGross, setMaxGross] = useState(null);

    //capturing the search query params from the url
    const [searchParams, setSearchParams] = useSearchParams();
    const searchQueryFromURL = searchParams.get("search");

    //capturing filter params from the url
    const languageFromURL = searchParams.get("language");

    const minGrossFromURL = searchParams.get("minGross");
    const maxGrossFromURL = searchParams.get("maxGross");

    //capturing sort params from the url
    const sortQueryFromURL = searchParams.get("sort");

    //creating a state to store the current page of the movie the user 
    //is viewing and total number of movies that will be shown in a page
    const[currentPage, setCurrentPage] = useState(1);
    const moviesPerPage = 10;

    //create a method to round the gross figure
    const getSliderMax = (gross) => {
        if (gross <= 0) {
            return 0;
        }

        const magnitude = 10 ** Math.floor(Math.log10(gross));
        const normalized = gross / magnitude;

        if (normalized <= 1) {
            return magnitude;
        } else if (normalized <= 2) {
            return 2 * magnitude;
        } else if (normalized <= 5) {
            return 5 * magnitude;
        } else {
            return 10 * magnitude;
        }
    };

    //create a method to find the appropriate step value 
    //depending on the slider max value
    const getSliderStep = (gross) => {
        if (gross < 10000) {
            return 100;
        }

        if (gross < 100000) {
            return 1000;
        }

        if (gross < 1000000) {
            return 10000;
        }

        if (gross < 10000000) {
            return 100000;
        }

        if (gross <= 100000000) {
            return 1000000;
        }

        if (gross < 1000000000) {
            return 10000000;
        }

        return 100000000;
    };

    const sliderStep =
        sliderMaxGross !== null
            ? getSliderStep(sliderMaxGross)
            : null;

    //run API call to retrieve all the movies in the database
    useEffect(() => {

        async function getMovies() {

            try {

                //collecting the search and other filter, sort parameters if there are any
                const params = new URLSearchParams();

                if (searchQueryFromURL) {
                    params.set("search", searchQueryFromURL);
                }

                if (languageFromURL) {
                    params.set("language", languageFromURL);
                }

                if (minGrossFromURL && maxGrossFromURL) {
                    params.set("minGross", minGrossFromURL);
                    params.set("maxGross", maxGrossFromURL);
                }

                if (sortQueryFromURL) {
                    params.set("sort", sortQueryFromURL);
                }

                const queryString = params.toString();

                const url = queryString
                    ? `${API_BASE_URL}/movies?${queryString}`
                    : `${API_BASE_URL}/movies`;

                const response = await fetch(url);

                const data = await response.json();

                console.log(data);

                setMovies(data);

                if (data.length > 0) {

                    const sliderMax = getSliderMax(
                        Number(data[0].max_total_gross)
                    );

                    setSliderMaxGross(sliderMax);

                    if (minGrossFromURL && maxGrossFromURL) {
                        setMinGross(Number(minGrossFromURL));
                        setMaxGross(Number(maxGrossFromURL));
                    
                    } else {
                        setMinGross(0);
                        setMaxGross(sliderMax);
                    }
                }
                

            } catch(error) {

                console.error(error);

            }

        }

        getMovies();

    }, [searchQueryFromURL, languageFromURL, minGrossFromURL, maxGrossFromURL, sortQueryFromURL]);


    //create a another useEffect hook to synchronize the textbox with the URL
    //and so it doesn't reset to its initial empty state after a refresh
    useEffect(() => {
        setSearchQuery(searchQueryFromURL || "");
    }, [searchQueryFromURL]);

    
    useEffect(() => {

        async function getLanguages() {
            
            try {

                const response = await fetch (`${API_BASE_URL}/languages`);

                const data = await response.json();

                console.log("Languages: ", data);

                setLanguages(data)

            } catch(error) {

                console.error(error);

            }

        }

        getLanguages();

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

    if (languageFromURL) {
        resultMessages.push(
            `Language filter applied: ${ISO6391.getName(languageFromURL)}`
        );
    }

    if (minGrossFromURL && maxGrossFromURL) {
        resultMessages.push(
            `Total Gross range applied: £ ${Number(minGrossFromURL).toLocaleString()} – £ ${Number(maxGrossFromURL).toLocaleString()}`
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

    //applying min and max position calculations
    //for our total gross sliders
    const minPosition = (minGross / sliderMaxGross) * 100;
    const maxPosition = (maxGross / sliderMaxGross) * 100;

    return (
        <>
        <h1 className="page-title">Movies</h1>

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

    <div className="filter-container">

        <div className="language-filter">
            <label htmlFor="language-selector">Select Language:</label>

            <select
                id="language-selector" 
                className="language-selector"
                onChange={(event) => {
                    const language = event.target.value;

                    setCurrentPage(1);

                    const currentSearchParams = new URLSearchParams(searchParams);

                    if (language) {
                        currentSearchParams.set("language", language);
                    } else {
                        currentSearchParams.delete("language");
                    }

                    setSearchParams(currentSearchParams);
                }}
                value={languageFromURL || ""}
            >
                <option value="">
                    All Languages
                </option>

                {languages.map(language => {

                    const languageCode = language.original_language;

                    const languageName = 
                        ISO6391.getName(languageCode) || 
                        languageFallbacks[languageCode]?.name ||
                        languageCode;

                    const nativeName = 
                        ISO6391.getNativeName(languageCode) || 
                        languageFallbacks[languageCode]?.nativeName
                        languageCode;

                    return (
                        <option
                            key={languageCode}
                            value={languageCode}
                        >
                            {languageCode != "en"
                                ? `${languageName} (${nativeName})`
                                : languageName
                            }
                        </option>
                    );
                })}
            </select>
        </div>

        <div className="gross-filter">

            <label>Select Total Gross Range</label>

            {sliderMaxGross !== null && (
                <div className="range-slider">

                    <div className="slider-track"></div>

                    <div 
                        className="slider-range"
                        style={{
                            left: `${minPosition}%`,
                            width: `${maxPosition - minPosition}%`
                        }}
                    ></div>

                    <input 
                        type="range"
                        min="0"
                        max={sliderMaxGross}
                        step={sliderStep}
                        value={minGross}
                        onChange={(event) => {
                            const value = Number(event.target.value);

                            if (value < maxGross) {
                                setMinGross(value);
                            }
                        }}
                    />

                    <input
                        type="range"
                        min="0"
                        max={sliderMaxGross}
                        step={sliderStep}
                        value={maxGross}
                        onChange={(event) => {
                            const value = Number(event.target.value);

                            if (value > minGross) {
                                setMaxGross(value);
                            }
                        }}
                    />

                </div>
            )}

            <p className="gross-range-display">
                £ {Number(minGross).toLocaleString()} – £ {Number(maxGross).toLocaleString()}
            </p>

            <div className="gross-filter-buttons">

                <button 
                    onClick={() => {
                        setCurrentPage(1);

                        const currentSearchParams = new URLSearchParams(searchParams);

                        if (minGross === 0 && maxGross === sliderMaxGross) {
                            currentSearchParams.delete("minGross");
                            currentSearchParams.delete("maxGross");
                        
                        } else {
                            currentSearchParams.set("minGross", minGross);
                            currentSearchParams.set("maxGross", maxGross);
                        }
                    
                        setSearchParams(currentSearchParams);
                    }}
                >
                    Apply
                </button>

                <button
                    onClick={() => {
                        setCurrentPage(1);

                        const currentSearchParams = new URLSearchParams(searchParams);

                        currentSearchParams.delete("minGross");
                        currentSearchParams.delete("maxGross");

                        setSearchParams(currentSearchParams);

                        setMinGross(0);
                        setMaxGross(sliderMaxGross);
                    }}
                >
                    Clear
                </button>

            </div>

        </div>

    </div>

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
                className="movie-card-link movie-card-link-detailed"
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

                        <p><strong>Country of Origin:</strong> {movie.country_of_origin}</p>

                        <p>
                            <strong>Original Language:</strong>{" "} 
                            {movie.original_language
                                ? `${languageName} ${languageCode !== "en" ? `(${nativeName})` : ""}` 
                                : "Language information is currently unavailable."}
                        </p>

                        <p><strong>Distributor:</strong> {movie.distributor_name}</p>

                        <p className="synopsis"><strong>Synopsis:</strong> {movie.synopsis || "No synopsis is currently available for this title."}</p>

                        <p><strong>Total Gross (as of {dateFormatter(movie.end_date)}):</strong> £ {Number(movie.total_gross_to_date).toLocaleString()}</p>

                        <p className="movie-details-link">
                        Click here to view more details
                        </p>
                    </aside>
                    </div>
                </Link>
            );

        })}

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
    )

}

export default Movies