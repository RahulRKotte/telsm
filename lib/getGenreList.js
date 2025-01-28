require('dotenv').config()
const { MovieDb } = require('moviedb-promise')
const moviedb = new MovieDb("9b90166edfecb09195b9512d9dd840d7")

async function getGenreList(language, type) {
  if (type === "movie") {
    const genre = await moviedb
      .genreMovieList({language})
      .then((res) => {
        return res.genres;
      })
      .catch(console.error);
      return genre
  } else {
    const genre = await moviedb
    .genreTvList({language})
    .then((res) => {
      return res.genres;
    })
    .catch(console.error);
    return genre
  }
}

module.exports = { getGenreList };
