import tmdbLogo from './assets/tmdb-logo.svg'

function About() {

    return (
        <main className="about-page">

            <h1 className="page-title">About</h1>

            <section>
                <h3>About the project</h3>

                <p>
                    The BFI UK Box Office Dashboard is an interactive
                    application for exploring the top 15 highest-grossing
                    films reported for selected UK weekends.
                </p>

                <p>
                    The dashboard combines UK weekend box-office data
                    from the British Film Institute (BFI) with additional
                    movie information and poster images from The Movie
                    Database (TMDB).
                </p>
            </section>

            <section>
                <h3>Data sources</h3>

                <h4>British Film Institute (BFI)</h4>

                <p>
                    Box-office data used by this application is sourced
                    from the BFI Weekend Box Office Reports.
                </p>

                <p>
                    <a
                        href="https://www.bfi.org.uk/industry-data-insights/weekend-box-office-figures"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Visit the BFI Weekend Box Office Reports
                    </a>
                </p>

                <h4>The Movie Database (TMDB)</h4>

                <p>
                    Additional movie information and poster images are
                    sourced through the TMDB API.
                </p>

                <p>
                    <a
                        href="https://www.themoviedb.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Visit The Movie Database
                    </a>
                </p>
            </section>

            <section>
                <h3>Data notes</h3>

                <p> 
                    Movie release dates shown in this application may not 
                    always correspond to the reporting weekend in which a 
                    film appears. Some films may be older releases that 
                    have returned to cinemas through re-releases, 
                    special screenings, or other limited theatrical events. 
                </p>

                <p> 
                    Release dates may also differ between sources due to 
                    regional release schedules. The BFI data represents 
                    UK cinema box-office reporting, while movie information 
                    and release dates are sourced from TMDB. As a result, 
                    the release date displayed for a film may not always 
                    match the UK theatrical date associated with its 
                    BFI reporting weekend. 
                </p>
            </section>

            <section>
                <h3>Attribution</h3>

                <img
                    src={tmdbLogo}
                    alt="The Movie Database (TMDB)"
                />

                <p>
                    This product uses the TMDB API but is not endorsed
                    or certified by TMDB.
                </p>

                <p>
                    Movie information and poster images are sourced from
                    The Movie Database (TMDB).
                </p>

                <p>
                    <a
                        href="https://www.themoviedb.org/about/logos-attribution"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        TMDB Logos & Attribution
                    </a>
                </p>
            </section>

        </main>
    )
}

export default About