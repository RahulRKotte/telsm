require("dotenv").config();
const { MovieDb } = require("moviedb-promise");
const moviedb = new MovieDb("9b90166edfecb09195b9512d9dd840d7");
const { getGenreList } = require("./getGenreList");
const { parseMedia } = require("../utils/parseProps");

async function getTrending(type, language, page, genre) {
  const media_type = type === "series" ? "tv" : type
  const parameters = {
    media_type,
    time_window: genre.toLowerCase(),
    language,
    page,
  };
  const genreList = await getGenreList(language, type);
  return await moviedb
    .trending(parameters)
    .then(async (res) => {
      const metas = res.results.map(el => parseMedia(el, type, genreList));
      return { metas };
    })
    .catch(console.error);
}

module.exports = { getTrending };
