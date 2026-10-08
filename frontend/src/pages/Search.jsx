import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function imageUrl(url) {
  if (!url) return null;

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  return url;
}

function GameCard({ game }) {
  const navigate = useNavigate();

  const cover = imageUrl(game.coverUrl);

  const year = game.firstReleaseDate
    ? new Date(game.firstReleaseDate * 1000).getFullYear()
    : null;

  const rating = game.rating
    ? (game.rating / 10).toFixed(1)
    : null;

  const genres = game.genres?.slice(0, 2) || [];

  return (
    <button
      onClick={() => navigate(`/game/${game.id}`)}
      className="group min-w-0 text-left"
    >
      {/* COVER */}
      <div className="relative mb-3 aspect-[2/3] overflow-hidden rounded-2xl border border-white/[0.07] bg-[#121218] shadow-lg shadow-black/20 transition-all duration-500 group-hover:-translate-y-1 group-hover:border-violet-500/40 group-hover:shadow-xl group-hover:shadow-violet-950/20">

        {cover ? (
          <img
            src={cover}
            alt={game.name}
            className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-zinc-500">
            No Cover
          </div>
        )}

        {/* IMAGE GRADIENT */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-50 transition-opacity duration-500 group-hover:opacity-90" />

        {/* HOVER BUTTON */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-3 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="inline-flex rounded-lg bg-violet-600 px-3 py-2 text-xs font-bold text-white shadow-lg shadow-violet-950/40">
            View Game
          </span>
        </div>
      </div>

      {/* TITLE */}
      <h3 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-zinc-100 transition-colors duration-300 group-hover:text-violet-400">
        {game.name}
      </h3>

      {/* RATING + YEAR */}
      <div className="mt-2 flex items-center gap-2">
        {rating && (
          <span className="text-xs font-semibold text-amber-400">
            ★ {rating}
          </span>
        )}

        {year && (
          <>
            {rating && (
              <span className="text-zinc-700">
                •
              </span>
            )}

            <span className="text-xs font-medium text-zinc-600">
              {year}
            </span>
          </>
        )}
      </div>

      {/* GENRES */}
      {genres.length > 0 && (
        <p className="mt-1 truncate text-xs text-zinc-600">
          {genres.join(" • ")}
        </p>
      )}
    </button>
  );
}

function Section({ label, title, games }) {
  if (!games || games.length === 0) {
    return null;
  }

  return (
    <section className="mt-16">
      {/* SECTION HEADER */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.32em] text-violet-400">
            {label}
          </p>

          <h2 className="text-2xl font-bold tracking-[-0.035em] text-white sm:text-3xl">
            {title}
          </h2>
        </div>

        <span className="text-xs font-medium text-zinc-600">
          {games.length} games
        </span>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
          />
        ))}
      </div>
    </section>
  );
}

export default function Search() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [discover, setDiscover] = useState(null);

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDiscover();
  }, []);

  async function loadDiscover() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/games/discover");

      setDiscover(response.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load Discover right now.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();

    const trimmed = query.trim();

    if (!trimmed) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      setError("");

      const response = await api.get(
        `/games/search?q=${encodeURIComponent(trimmed)}`
      );

      setSearchResults(response.data || []);
    } catch (err) {
      console.error(err);
      setError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  const featured = discover?.featured;

  return (
    <main className="min-h-screen bg-[#08080c] text-white">

      {/* ATMOSPHERIC BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-violet-600/[0.07] blur-[140px]" />

        <div className="absolute right-[-200px] top-[20%] h-[500px] w-[500px] rounded-full bg-indigo-500/[0.06] blur-[150px]" />
      </div>

      <div className="mx-auto max-w-[1500px] px-5 py-12 sm:px-8 lg:px-12">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-9">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.35em] text-violet-400">
            GameShelf
          </p>

          <h1 className="text-5xl font-bold tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            <span className="text-white">
              Discover
            </span>

            <span className="ml-2 bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              .
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-500 sm:text-lg">
            Find your next obsession. Explore games, build your shelf,
            and see what the community is playing.
          </p>
        </div>


        {/* =====================================================
            SEARCH
        ===================================================== */}

        <form
          onSubmit={handleSearch}
          className="mb-12 flex max-w-3xl gap-3"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a game..."
            className="h-12 flex-1 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-5 text-[15px] text-white shadow-inner shadow-black/20 backdrop-blur-xl outline-none transition-all duration-300 placeholder:text-zinc-600 focus:border-violet-500/60 focus:bg-white/[0.055] focus:shadow-lg focus:shadow-violet-950/10"
          />

          <button
            type="submit"
            disabled={searching}
            className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 text-sm font-semibold text-white shadow-lg shadow-violet-950/20 transition-all duration-300 hover:-translate-y-0.5 hover:from-violet-500 hover:to-indigo-500 hover:shadow-violet-900/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </form>


        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}


        {/* =====================================================
            SEARCH RESULTS
        ===================================================== */}

        {searchResults.length > 0 ? (
          <section>

            <div className="mb-7 flex items-end justify-between">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.32em] text-violet-400">
                  Search
                </p>

                <h2 className="text-2xl font-bold tracking-[-0.035em] sm:text-3xl">
                  Results for "{query}"
                </h2>
              </div>

              <button
                onClick={() => {
                  setSearchResults([]);
                  setQuery("");
                }}
                className="text-sm font-medium text-zinc-500 transition hover:text-white"
              >
                Clear
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {searchResults.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                />
              ))}
            </div>

            <button
              onClick={() => {
                setSearchResults([]);
                setQuery("");
              }}
              className="mt-10 text-sm font-medium text-violet-400 transition hover:text-violet-300"
            >
              ← Back to Discover
            </button>

          </section>
        ) : (

          <>
            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (
              <div className="py-28 text-center">
                <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.35em] text-violet-400">
                  GameShelf
                </div>

                <div className="text-2xl font-bold tracking-tight text-white">
                  Loading discovery...
                </div>
              </div>
            )}


            {/* =================================================
                DISCOVER
            ================================================= */}

            {!loading && discover && (
              <>

                {/* =================================================
                    FEATURED HERO
                ================================================= */}

                {featured && (
                  <section className="relative mb-16 min-h-[440px] overflow-hidden rounded-3xl border border-white/[0.08] bg-[#101016] shadow-2xl shadow-black/30">

                    {featured.coverUrl && (
                      <img
                        src={imageUrl(featured.coverUrl)}
                        alt=""
                        className="absolute inset-0 h-full w-full scale-105 object-cover opacity-35 blur-[2px]"
                      />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-r from-[#08080c] via-[#08080ce8] to-[#08080c55]" />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-transparent to-transparent" />

                    <div className="relative z-10 flex min-h-[440px] items-end p-8 sm:p-10 lg:p-14">

                      <div className="max-w-2xl">

                        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.35em] text-violet-400">
                          Featured
                        </p>

                        <h2 className="mb-5 text-4xl font-bold tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
                          {featured.name}
                        </h2>

                        {featured.summary && (
                          <p className="mb-7 line-clamp-3 max-w-xl text-sm leading-7 text-zinc-400">
                            {featured.summary}
                          </p>
                        )}

                        <button
                          onClick={() =>
                            navigate(`/game/${featured.id}`)
                          }
                          className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-950/30 transition-all duration-300 hover:-translate-y-0.5 hover:from-violet-500 hover:to-indigo-500"
                        >
                          View Game
                        </button>

                      </div>

                    </div>

                  </section>
                )}


                {/* =================================================
                    TRENDING
                ================================================= */}

                <Section
                  label="GameShelf"
                  title="Trending Now"
                  games={discover.trending}
                />


                {/* =================================================
                    POPULAR
                ================================================= */}

                <Section
                  label="GameShelf"
                  title="Popular Games"
                  games={discover.popular}
                />


                {/* =================================================
                    RECENT
                ================================================= */}

                <Section
                  label="GameShelf"
                  title="Recently Released"
                  games={discover.recent}
                />

              </>
            )}

          </>
        )}

      </div>
    </main>
  );
}