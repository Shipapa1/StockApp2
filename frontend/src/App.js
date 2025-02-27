import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      {/* Navbar */}
      <header className="App-header">
        <img className="App-logo" src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix Logo" />
        <button className="App-button">Sign In</button>
      </header>

      {/* Banner */}
      <div className="banner">
        <div className="banner__contents">
          <h1 className="banner__title">NETFLIX ORIGINALS</h1>
          <div className="banner__buttons">
            <button className="banner__button">Play</button>
            <button className="banner__button">My List</button>
          </div>
        </div>
        <div className="banner--fadeBottom"></div>
      </div>

      {/* Movie Row */}
      <div className="row">
        <h2>Trending Now</h2>
        <div className="row__posters">
          {/* Add movie posters here */}
          <img className="row__poster row__posterLarge" src="https://image.tmdb.org/t/p/original/9vpmF4Z4f2F53AZfAovtW2duHno.jpg" alt="Movie poster" />
          <img className="row__poster row__posterLarge" src="https://image.tmdb.org/t/p/original/wH2xSuIDjTGfA6uqHZwDyo6unO7.jpg" alt="Movie poster" />
          {/* Add more posters as needed */}
        </div>
      </div>

      {/* Additional Rows */}
      <div className="row">
        <h2>Top Rated</h2>
        <div className="row__posters">
          {/* Add movie posters here */}
        </div>
      </div>

      {/* Add more categories like 'Action Movies', 'Comedy', etc. */}
    </div>
  );
}

export default App;
