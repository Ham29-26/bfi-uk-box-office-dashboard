import { Link } from "react-router-dom";

function MovieCard(props) {
    console.log(props.movie);
    console.log(props.selectedWeekend);

    let film_rank_with_emoji;

    if (props.movie.film_rank === 1) {
      film_rank_with_emoji = "🥇 " + props.movie.film_rank;
    } else if (props.movie.film_rank === 2) {
      film_rank_with_emoji = "🥈 " + props.movie.film_rank;
    } else if (props.movie.film_rank === 3) {
      film_rank_with_emoji = "🥉 " + props.movie.film_rank;
    } else {
      film_rank_with_emoji = props.movie.film_rank;
    }

    const weekendGross = "£" + Number(props.movie.weekend_gross).toLocaleString();
    const totalGross = "£" + Number(props.movie.total_gross_to_date).toLocaleString();

    return (
      <Link 
        className="movie-card-link"
        key={props.movie.film_id}
        to={`/movies/${props.movie.film_id}/box-office/${props.selectedWeekend}`}
      >
        <div className="movie-card">
          <img 
              src={`https://image.tmdb.org/t/p/w500${props.movie.film_poster_img_path}`}
              alt={`${props.movie.film_title.replace(' ', '_')}_film_poster`}
          />

          <aside>
            <h2>{film_rank_with_emoji}. {props.movie.film_title}</h2>

            <p>Weekend Gross: {weekendGross}</p>

            <p>Total Gross to Date: {totalGross}</p>

            <p className="movie-details-link">
              Click here to view more details
            </p>
          </aside>
        </div>
      </Link>
    )

}

export default MovieCard