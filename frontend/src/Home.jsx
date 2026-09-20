import { useState } from 'react'
import { useEffect } from 'react'
import MovieCard from './MovieCard'

function Home(props) {
    const [weekends, setWeekends] = useState([])
    const [selectedWeekend, setSelectedWeekend] = useState("")
    const [movies, setMovies] = useState([])

    //run API call to retrieve all the reporting weekends
    useEffect(() => {

        async function getReportingWeekends() {

            try {

                const response = await fetch("http://localhost:3000/api/reporting-weekends");

                const data = await response.json();

                setWeekends(data);
                
                setSelectedWeekend(data[0].reporting_id)

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

                if (selectedWeekend) {

                    const response = await fetch(`http://localhost:3000/api/reporting-weekends/${selectedWeekend}/movies`);

                    const data = await response.json();

                    setMovies(data);

                }

            } catch(error) {

                console.error(error);

            }

        }

        getMoviesByReportingWeekend();

    }, [selectedWeekend]);

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
    
    //capturing the selected weekend data
    const selectedWeekendData = weekends.find(
        weekend => weekend.reporting_id === Number(selectedWeekend)
    );
    


    return (
    <>
        <select 
            className="weekend-selector"
            onChange={(event) => setSelectedWeekend(event.target.value)}>
        {weekends.map(weekend =>
            <option 
            key={weekend.reporting_id}
            value={weekend.reporting_id}>
            {dateFormatter(weekend.start_date, weekend.end_date)}
            </option>
        )}
        </select>

        <p className="selected-weekend">
        Selected weekend: {
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
                selectedWeekend={selectedWeekend}
            />
        )}
    </>
    )

}

export default Home