require("dotenv").config();
const { MovieDb } = require("moviedb-promise");
const moviedb = new MovieDb("9b90166edfecb09195b9512d9dd840d7");

async function getLanguages() {
  const [primaryTranslations, languages] = await Promise.all([
    moviedb.primaryTranslations(),
    moviedb.languages(),
  ]);
  return primaryTranslations.map((element) => {
    const [language, country] = element.split("-");
    const findLanguage = languages.find((obj) => obj.iso_639_1 === language);
    return { iso_639_1: element, name: findLanguage.english_name};
  });
}

module.exports = { getLanguages };
