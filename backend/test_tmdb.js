require("dotenv").config();

fetch("https://api.themoviedb.org/3/search/movie?query=Scary%20Movie&primary_release_year=2026", {
    headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`
    }
})
    .then(response => {
        console.log("HTTP status:", response.status);
        return response.json();
    })
    .then(data => {
        console.log(data);
    })
    .catch(error => console.error(error));