import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom';
import MovieCard from './MovieCard'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Home(props) {

    //state variable to control the url param queries in the url
    const [searchParams, setSearchParams] = useSearchParams();
    
    //state variable to hold all the formatted/grouped reporting weekends
    const [groupedWeekends, setGroupedWeekends] = useState({});

    //state variables to hold the selected year, month and weekend id values
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedWeekendId, setSelectedWeekendId] = useState("");
    
    //state variable to hold the collection of all the movies to be displayed 
    //for a particular weekend
    const [movies, setMovies] = useState([]);

    //run API call to retrieve all the reporting weekends
    useEffect(() => {

        async function getReportingWeekends() {

            try {

                const response = await fetch(`${API_BASE_URL}/reporting-weekends`);

                const data = await response.json();

                const groupedWeekendsAsc = data.groupedWeekendsAsc;

                setGroupedWeekends(groupedWeekendsAsc);

                const groupedWeekendsDesc = data.groupedWeekendsDesc;

                const years = Object.keys(groupedWeekendsDesc);

                const weekendFromUrl = searchParams.get("weekend");

                if (weekendFromUrl) {

                    const weekendId = Number(weekendFromUrl);

                    for (const year of years) {

                        const months = Object.keys(groupedWeekendsDesc[year]);

                        for (const month of months) {

                            const weekend = groupedWeekendsDesc[year][month].find(
                                weekend => weekend.reporting_id === weekendId
                            );

                            if (weekend) {

                                setSelectedYear(year);
                                setSelectedMonth(month);
                                setSelectedWeekendId(weekend.reporting_id);

                                return;
                            }
                        }
                    }

                }

                // No weekend in URL -> use the most recent reporting weekend

                setSelectedYear(years[0]);

                const months = Object.keys(groupedWeekendsDesc[years[0]]);

                setSelectedMonth(months[0]);

                const latestWeekendId =
                    groupedWeekendsDesc[years[0]][months[0]][0].reporting_id;

                setSelectedWeekendId(latestWeekendId);

                setSearchParams({ weekend: latestWeekendId });

            } catch(error) {

                console.error(error);

            }

        }

        getReportingWeekends();

    }, []);

    //run API call to retrieve all movies of a selected reporting weekend
    useEffect(() => {

        async function getMoviesByReportingWeekend() {
            
            try {

                if (selectedWeekendId) {

                    const response = await fetch(`${API_BASE_URL}/reporting-weekends/${selectedWeekendId}/movies`);

                    const data = await response.json();

                    setMovies(data);

                }

            } catch(error) {

                console.error(error);

            }

        }

        getMoviesByReportingWeekend();

    }, [selectedWeekendId]);


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

    const dateFormatter = (strStartDate, strEndDate) => {
        const startDate = new Date(strStartDate)
        const endDate = new Date(strEndDate)

        //in case of single digit dates pad the start of the date 
        // with an extra 0 so it becomes 05 June and not 5 June
        const startDay = String(startDate.getDate()).padStart(2, "0");
        const endDay = String(endDate.getDate()).padStart(2, "0")

        //if the start and end date months are different specify both month names
        if (startDate.getMonth() != endDate.getMonth()) {
            return startDay
            + " " + months[startDate.getMonth()] 
            + " – " + endDay 
            + " " + months[endDate.getMonth()]
        }

        //if the start and end date months are the same specify only one month name
        return startDay + " – " + endDay + " " + months[startDate.getMonth()]
    }
    
    //capturing the selected weekend data
    const selectedWeekendData = (groupedWeekends[selectedYear]?.[selectedMonth] || []).find(
        weekend => weekend.reporting_id === Number(selectedWeekendId)
    );

    //collecting all the year entries from our reportingWeekends object 
    // and storing them as an array
    const dropdownYears = Object.keys(groupedWeekends);

    return (
    <>
    <div className="selector-container">

        <div className="selector-group">
            <label htmlFor="year-selector">Select Year:</label>

            <select
                id="year-selector" 
                className="selector"
                onChange={(event) => {
                    setSelectedYear(event.target.value)

                    //collecting month keys of the selected year and then storing the first month
                    const selectedYearMonthKeys = Object.keys(groupedWeekends[event.target.value]);
                    const firstMonth = selectedYearMonthKeys[0];

                    setSelectedMonth(firstMonth)
                }}
                value={selectedYear}
            >
                {dropdownYears.map(year => 
                    <option
                    key={year}
                    value={year}
                    >
                        {year}
                    </option>
                )}
            </select>
        </div>

        <div className="selector-group">
            <label htmlFor="month-selector">Select Month:</label>

            <select
                id="month-selector"
                className="selector"
                onChange={(event) => {

                    const month = event.target.value;

                    setSelectedMonth(month);

                    const weekendId = groupedWeekends[selectedYear][month][0].reporting_id

                    setSelectedWeekendId(weekendId);

                    setSearchParams({ weekend: weekendId });
                }}
                value={selectedMonth}
            >
                {Object.keys(groupedWeekends[selectedYear] || {}).map(month =>
                    <option
                    key={month}
                    value={month}
                    >
                        {month}
                    </option>
                )}
            </select>
        </div>

        <div className="selector-group">
            <label htmlFor="weekend-selector">Select Weekend:</label>

            <select
                id="weekend-selector" 
                className="selector"
                onChange={(event) => {

                    const weekendId = event.target.value;

                    setSelectedWeekendId(weekendId);

                    setSearchParams({ weekend: weekendId });

                }}
                value={selectedWeekendId}
            >
                {(groupedWeekends[selectedYear]?.[selectedMonth] || []).map(weekend =>
                    <option 
                    key={weekend.reporting_id}
                    value={weekend.reporting_id}
                    >
                        {dateFormatter(weekend.start_date, weekend.end_date)}
                    </option>
                )}
            </select>
        </div>

    </div>

    <p className="selected-weekend">
    Showing films for {
        selectedWeekendData
        ? dateFormatter(
            selectedWeekendData.start_date,
            selectedWeekendData.end_date
        )
        : ""
    }
    </p>

    {movies.map(movie =>
        <MovieCard 
            key={movie.film_id}
            movie={movie}
            selectedWeekendId={selectedWeekendId}
        />
    )}
    </>
    )

}

export default Home