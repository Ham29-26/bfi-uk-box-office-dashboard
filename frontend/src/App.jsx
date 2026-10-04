import './App.css'
import Header from './Header'
import Home from './Home'
import About from './About'
import Movies from './Movies'
import MovieDetails from './MovieDetails'
import { Routes, Route, Link } from 'react-router-dom'
import Distributors from './Distributors'
import DistributorMovies from './DistributorMovies'

function App() {

  return (
    <>
    <Header 
        title="BFI UK Box Office"
        subtitle="Explore the top 15 highest-grossing films for a selected UK weekend."
    />

    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/movies">Movies</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/distributors">Distributors</Link>
        </li>
      </ul>
    </nav>

    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/distributors" element={<Distributors />}/>
        <Route path="/movies/:filmId/box-office/:reportingId" element={<MovieDetails />} />
        <Route path="/distributors/:distributorId/movies" element={<DistributorMovies />}/>
    </Routes>

    <footer className="site-footer">
      <p>
        Built by Hamza Kazi
      </p>

      <div className="footer-links">
        <a
          href="https://github.com/Ham29-26"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>

        <a
          href="https://www.linkedin.com/in/hamza-kazi1"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
      </div>
    </footer>
    </>
  )
}

export default App
