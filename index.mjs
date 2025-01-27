import pkg from "stremio-addon-sdk";
import fetch from "node-fetch"; // Ensure `node-fetch` is installed

const TMDB_API_KEY = "9b90166edfecb09195b9512d9dd840d7";
const { addonBuilder, serveHTTP } = pkg;

const manifest = {
  id: "org.telugu-movies-series",
  version: "1.0.0",
  name: "Telugu Movies & Series",
  description: "Provides a catalog of Telugu movies and series.",
  resources: ["catalog", "meta", "stream"], // Added 'stream' for Torrentio integration
  types: ["movie", "series"],
  catalogs: [
    {
      id: "telugu-movies",
      type: "movie",
      name: "Telugu Movies",
    },
    {
      id: "telugu-series",
      type: "series",
      name: "Telugu Series",
    },
  ],
};

const builder = new addonBuilder(manifest);

// Function to fetch content from TMDB
async function fetchTMDbContent(type) {
  console.log(`Fetching ${type} from TMDb...`);
  const baseUrl = `https://api.themoviedb.org/3/discover/${type}`;
  const today = new Date().toISOString().split("T")[0];
  let allResults = [];
  let page = 1;

  while (true) {
    const url = `${baseUrl}?api_key=${TMDB_API_KEY}&with_original_language=te&sort_by=release_date.desc&include_adult=true&release_date.lte=${today}&page=${page}`;
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        console.log(`Fetched ${data.results.length} items from page ${page}...`);
        allResults.push(
          ...data.results.map((item) => ({
            id: item.id.toString(),
            name: item.title || item.name,
            poster: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
            background: item.backdrop_path
              ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
              : undefined,
            description: item.overview || "No description available.",
            releaseInfo: item.release_date
              ? item.release_date.split("-")[0]
              : "Unknown",
            type,
          }))
        );

        // Stop if we've reached the last page
        if (page >= data.total_pages) break;

        // Fetch next page
        page++;
      } else {
        console.log(`No more results found on page ${page}.`);
        break;
      }
    } catch (error) {
      console.error("Error fetching data from TMDb:", error);
      break;
    }
  }

  console.log(`Fetched a total of ${allResults.length} ${type} items.`);
  return allResults;
}

// Catalog Handler
builder.defineCatalogHandler(async ({ type, id }) => {
  console.log(`Handling catalog request for ${id} of type ${type}...`);
  if (id === "telugu-movies" && type === "movie") {
    const movies = await fetchTMDbContent("movie");
    return { metas: movies };
  }

  if (id === "telugu-series" && type === "series") {
    const series = await fetchTMDbContent("tv");
    return { metas: series };
  }

  return { metas: [] };
});

// Metadata Handler
builder.defineMetaHandler(async ({ type, id }) => {
  console.log(`Handling metadata request for ${type} with ID ${id}...`);
  const url = `https://api.themoviedb.org/3/${type}/${id}?api_key=${TMDB_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(`Fetched metadata for ${data.title || data.name}`);
    return {
      meta: {
        id: data.id.toString(),
        name: data.title || data.name,
        poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
        background: data.backdrop_path
          ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}`
          : undefined,
        description: data.overview || "No description available.",
        releaseInfo: data.release_date
          ? data.release_date.split("-")[0]
          : "Unknown",
        runtime: data.runtime || "N/A",
        cast: (data.credits?.cast || []).slice(0, 10).map((person) => person.name),
        director:
          (data.credits?.crew || []).find((crew) => crew.job === "Director")?.name ||
          "N/A",
        imdbRating: data.vote_average ? data.vote_average.toString() : "N/A",
        genres: data.genres.map((genre) => genre.name),
        type,
      },
    };
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return { meta: {} };
  }
});

// Stream Handler (Torrentio Integration)
builder.defineStreamHandler(async ({ type, id }) => {
  console.log(`Handling stream request for ${type} with ID ${id}...`);
  const torrentioUrl = `https://torrentio.strem.fun/${type}/${id}.json`;
  try {
    const response = await fetch(torrentioUrl);
    const streams = await response.json();
    return { streams };
  } catch (error) {
    console.error("Error fetching streams from Torrentio:", error);
    return { streams: [] };
  }
});

// Start the HTTP server
serveHTTP(builder.getInterface(), { port: process.env.PORT || 43002 });

