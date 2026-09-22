import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import ISO6391 from "iso-639-1"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";


function CustomTooltip({ active, payload, type }) {

    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const data = payload[0].payload;

    if (type === "totalGross") {
        return (
            <div className="chart-tooltip">
                <p className="tooltip-weekend">{data.weekend}</p>

                <p>
                    <span>Total Gross:</span>{" "}
                    £ {data.totalGross.toLocaleString()}
                </p>

                <p>
                    <span>Weeks on Release:</span>{" "}
                    {data.weeksOnRelease}
                </p>
            </div>
        );
    }

    return (
        <div className="chart-tooltip">
            <p className="tooltip-weekend">{data.weekend}</p>

            <p>
                <span>Weekend Gross:</span>{" "}
                £ {data.weekendGross.toLocaleString()}
            </p>

            <p>
                <span>% Change:</span>{" "}
                {data.percentChange === null
                    ? "–"
                    : `${data.percentChange > 0 ? "+" : ""}${(
                        data.percentChange * 100
                    ).toFixed(0)}%`}
            </p>

            <p>
                <span>Film Rank:</span> #{data.filmRank}
            </p>
        </div>
    );
}

function MovieDetails() {

    //capturing the film and reporting IDs from the URL params
    const params = useParams();
    const filmId = params.filmId
    const reportingId = params.reportingId

    const [weekends, setWeekends] = useState([]);
    const [moviePerformance, setMoviePerformance] = useState([]);
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
    
    //run API call to retrieve all the performance details (including historical) 
    //about the selected movie for the selected weekend
    useEffect(() => {

        async function getMovieDetails() {
            
            try {

                const response = await fetch(`http://localhost:3000/api/movies/${filmId}/box-office/${reportingId}`);

                const data = await response.json();

                setMoviePerformance(data);

                setSelectedMovie(
                    data.find(movie => movie.reporting_id == Number(reportingId))
                );

            } catch(error) {

                console.error(error);

            }

        }

        getMovieDetails();

    }, [filmId, reportingId]);

    
    console.log("Selected Movie: ", selectedMovie);


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
        const day = String(date.getDate()).padStart(2, "0")

        return day + " " + months[date.getMonth()] + ", " + date.getFullYear();
    }

    const doubleDateFormatter = (strStartDate, strEndDate) => {
        const startDate = new Date(strStartDate)
        const endDate = new Date(strEndDate)

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

    let film_rank_with_emoji;

    if (selectedMovie.film_rank === 1) {
      film_rank_with_emoji = "🥇 " + selectedMovie.film_rank;
    } else if (selectedMovie.film_rank === 2) {
      film_rank_with_emoji = "🥈 " + selectedMovie.film_rank;
    } else if (selectedMovie.film_rank === 3) {
      film_rank_with_emoji = "🥉 " + selectedMovie.film_rank;
    } else {
      film_rank_with_emoji = selectedMovie.film_rank;
    }

    const chartData = {
        weekendGross: moviePerformance.map(performance => ({
            weekend: doubleDateFormatter(
                performance.start_date,
                performance.end_date
            ),
            weekendGross: Number(performance.weekend_gross),
            percentChange: performance.percent_change === null
                ? null
                : Number(performance.percent_change),
            filmRank: performance.film_rank
        })),

        totalGross: moviePerformance.map(performance => ({
            weekend: doubleDateFormatter(
                performance.start_date,
                performance.end_date
            ),
            totalGross: Number(performance.total_gross_to_date),
            weeksOnRelease: performance.weeks_on_release
        }))
    };


    function formatMillions(value) {
        return `£${(value / 1000000).toFixed(1)}m`
    }


    return (
        <>
        <h1 className="page-title">Movie Details</h1>

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

        <div className="movie-card movie-card-details" key={selectedMovie.film_id}>
            <img 
                src={`https://image.tmdb.org/t/p/w500${selectedMovie.film_poster_img_path}`}
                alt={`${selectedMovie.film_title?.replace(" ", "_")}_film_poster`}
            />

            <aside>
                <h2>{selectedMovie.film_title}</h2>

                <p><strong>Film Rank:</strong> {film_rank_with_emoji}</p>

                <p><strong>Release Date:</strong> {singleDateFormatter(selectedMovie.release_date)}</p>

                <p><strong>Weeks on Release:</strong> {selectedMovie.weeks_on_release}</p>

                <p><strong>Country of Origin:</strong> {selectedMovie.country_of_origin}</p>

                <p><strong>Original Language:</strong> {ISO6391.getName(selectedMovie.original_language)} {selectedMovie.original_language !== "en" ? ISO6391.getNativeName(selectedMovie.original_language) : ""}</p>

                <p><strong>Distributor:</strong> {selectedMovie.distributor_name}</p>

                <p><strong>Synopsis:</strong> {selectedMovie.synopsis}</p>
            </aside>
        </div>

        <h2 className="page-title">
            Selected Weekend Performance
        <br></br><br></br>
            {doubleDateFormatter(selectedMovie.start_date, selectedMovie.end_date)}
        </h2>

        <div className="selected-weekend-figures">

            <div className="metric-card">
                <h3>Weekend Gross</h3>
                <p>£ {Number(selectedMovie.weekend_gross).toLocaleString()}</p>
            </div>

            <div className="metric-card">
                <h3>Total Gross to Date</h3>
                <p>£ {Number(selectedMovie.total_gross_to_date).toLocaleString()}</p>
            </div>
        </div>

        <h2 className="page-title">Weekend Gross</h2>

        <div className="chart-card">
            <ResponsiveContainer width="100%" height={400}>
                <LineChart 
                    data={chartData.weekendGross}
                    margin={{
                        top: 10,
                        right: 20,
                        left: 35,
                        bottom: 10
                    }}
                >
                    
                    <CartesianGrid 
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                    />

                    <XAxis 
                        dataKey="weekend"
                        tick={{ 
                            fill: "var(--text-muted)",
                            dy: 15 
                        }} 
                        axisLine={{ stroke: "var(--border)" }}
                        tickLine={{ stroke: "var(--border)" }}
                    />

                    <YAxis 
                        tickFormatter={formatMillions}
                        tick={{ fill: "var(--text-muted)" }}
                        axisLine={{ stroke: "var(--border)" }}
                        tickLine={{ stroke: "var(--border)" }}
                    />

                    <Tooltip content={<CustomTooltip  type="weekendGross" />} />
                    
                    <Line 
                        type="monotone"
                        dataKey="weekendGross"
                        stroke="var(--accent)"
                        strokeWidth={3}
                        dot={{
                            r: 5,
                            fill: "var(--accent)"
                        }}
                        activeDot={{
                            r: 7
                        }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>

        <h2 className="page-title">Total Gross to Date</h2>

        <div className="chart-card">
            <ResponsiveContainer width="100%" height={400}>
                <LineChart 
                    data={chartData.totalGross}
                    margin={{
                        top: 10,
                        right: 20,
                        left: 35,
                        bottom: 10
                    }}
                >
                    
                    <CartesianGrid 
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                    />

                    <XAxis 
                        dataKey="weekend"
                        tick={{ 
                            fill: "var(--text-muted)",
                            dy: 15 
                        }} 
                        axisLine={{ stroke: "var(--border)" }}
                        tickLine={{ stroke: "var(--border)" }}
                    />

                    <YAxis 
                        tickFormatter={formatMillions}
                        tick={{ fill: "var(--text-muted)" }}
                        axisLine={{ stroke: "var(--border)" }}
                        tickLine={{ stroke: "var(--border)" }}
                    />

                    <Tooltip content={<CustomTooltip type="totalGross" />} />
                    
                    <Line 
                        type="monotone"
                        dataKey="totalGross"
                        stroke="var(--accent)"
                        strokeWidth={3}
                        dot={{
                            r: 5,
                            fill: "var(--accent)"
                        }}
                        activeDot={{
                            r: 7
                        }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>

         <h2 className="page-title">Performance Metrics</h2>

        <div className="performance-metric">

            <div className="metric-card">
                <h3>Change from Previous Week</h3>  
                <p>
                    {selectedMovie.percent_change === null
                        ? "–"
                        : `${selectedMovie.percent_change > 0 ? "+" : ""}${(
                            selectedMovie.percent_change * 100
                        ).toFixed(0)}%`}
                </p>   
            </div>

            <div className="metric-card">
                <h3>Number of Cinemas</h3>   
                <p>{selectedMovie.number_of_cinemas}</p>
            </div>

            <div className="metric-card">
                <h3>Site Average</h3>
                <p>£ {Number(selectedMovie.site_average).toLocaleString()}</p>
            </div>
        </div>
        </>
    );

}


export default MovieDetails