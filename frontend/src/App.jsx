import { useState } from 'react'
import { useEffect } from 'react'
import './App.css'
import Header from './Header'

function App() {
  const [weekends, setWeekends] = useState([])
  const [selectedWeekend, setSelectedWeekend] = useState("")
  const [movies, setMovies] = useState([])

  //run API call to retrieve all the reporting weekends
  useEffect(() => {
    fetch("http://localhost:3000/api/reporting-weekends")
      .then(response => response.json())
      .then(data => {
        setWeekends(data)
        setSelectedWeekend(data[0].reporting_id)
      })
  }, [])

  //run API call to retrieve all movies of a selected reporting weekend
  useEffect(() => {
    if (selectedWeekend) {
      fetch(`http://localhost:3000/api/reporting-weekends/${selectedWeekend}/movies`)
        .then(response => response.json())
        .then(data => setMovies(data))
    }
  }, [selectedWeekend])

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

  return (
    <>
    <Header 
        title="BFI UK Box Office Dashboard"
        subtitle="UK weekend box office data and analysis"
    />

    <select onChange={(event) => setSelectedWeekend(event.target.value)}>
      {weekends.map(weekend =>
        <option 
          key={weekend.reporting_id}
          value={weekend.reporting_id}>
          {dateFormatter(weekend.start_date, weekend.end_date)}
        </option>
      )}
    </select>

    <p>Selected weekend: {selectedWeekend}</p>

    {movies.map(movie => 
      <div key={movie.film_rank}>
        <p>{movie.film_rank}. {movie.film_title}</p>

        <img
            src={`https://image.tmdb.org/t/p/w500${movie.film_poster_img_path}`}
        />
      </div>
    )}
    </>
  )
}

export default App
