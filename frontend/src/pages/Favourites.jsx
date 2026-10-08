import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function imageUrl(url, size = "t_cover_big") {
  if (!url) return null;

  let finalUrl = url;

  if (finalUrl.startsWith("//")) {
    finalUrl = "https:" + finalUrl;
  }

  return finalUrl.replace(/\/t_[^/]+\//, `/${size}/`);
}

export default function Favourites() {
  const navigate = useNavigate();

  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================================================
  // LOAD FAVOURITES
  // ==================================================

  useEffect(() => {
    async function loadFavourites() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/favourites");

        console.log("Favourites response:", response.data);

        const data = Array.isArray(response.data)
          ? response.data
          : [];

        setFavourites(data);
      } catch (err) {
        console.error("Failed to load favourites:", err);

        if (err.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else if (err.response?.status === 403) {
          setError("You are not authorised to view your favourites.");
        } else {
          setError("Could not load your favourites.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadFavourites();
  }, []);

  // ==================================================
  // REMOVE FAVOURITE
  // ==================================================

  async function handleRemoveFavourite(gameId) {
    try {
      await api.delete(`/favourites/${gameId}`);

      setFavourites((current) =>
        current.filter(
          (favourite) => favourite.game?.id !== gameId
        )
      );
    } catch (err) {
      console.error(
        "Failed to remove favourite:",
        err
      );

      alert("Could not remove this game from your favourites.");
    }
  }

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080c] text-white">

        <div className="max-w-7xl mx-auto px-6 py-16">

          <div className="mb-12">
            <p className="text-violet-400 text-xs uppercase tracking-[0.3em] mb-3">
              Your Collection
            </p>

            <h1 className="text-4xl md:text-5xl font-black">
              Favourites
            </h1>

            <p className="text-gray-500 mt-3">
              Loading your favourite games...
            </p>
          </div>

          <div className="flex items-center justify-center py-24">

            <div className="text-center">

              <div className="w-10 h-10 border-2 border-white/10 border-t-violet-500 rounded-full animate-spin mx-auto mb-5" />

              <p className="text-gray-500">
                Loading Favourites...
              </p>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================

  if (error) {
    return (
      <div className="min-h-screen bg-[#08080c] text-white">

        <div className="max-w-7xl mx-auto px-6 py-16">

          <div className="mb-12">

            <p className="text-violet-400 text-xs uppercase tracking-[0.3em] mb-3">
              Your Collection
            </p>

            <h1 className="text-4xl md:text-5xl font-black">
              Favourites
            </h1>

          </div>

          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-10 text-center">

            <div className="text-red-400 text-lg font-semibold mb-3">
              Something went wrong
            </div>

            <p className="text-gray-500 mb-7">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 transition font-semibold"
            >
              Try Again
            </button>

          </div>

        </div>

      </div>
    );
  }

  // ==================================================
  // EMPTY STATE
  // ==================================================

  if (favourites.length === 0) {
    return (
      <div className="min-h-screen bg-[#08080c] text-white">

        <div className="max-w-7xl mx-auto px-6 py-16">

          <div className="mb-12">

            <p className="text-violet-400 text-xs uppercase tracking-[0.3em] mb-3">
              Your Collection
            </p>

            <h1 className="text-4xl md:text-5xl font-black">
              Favourites
            </h1>

            <p className="text-gray-500 mt-3">
              Games you love, all in one place.
            </p>

          </div>

          <div className="min-h-[400px] rounded-3xl border border-white/10 bg-[#111116] flex items-center justify-center">

            <div className="text-center px-6">

              <div className="text-6xl mb-6">
                ♡
              </div>

              <h2 className="text-2xl font-bold mb-3">
                No favourites yet
              </h2>

              <p className="text-gray-500 max-w-md mx-auto mb-8">
                Find games you love and add them to your
                favourites. They'll appear here.
              </p>

              <button
                onClick={() => navigate("/search")}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition font-semibold"
              >
                Discover Games
              </button>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // ==================================================
  // FAVOURITES PAGE
  // ==================================================

  return (
    <div className="min-h-screen bg-[#08080c] text-white">

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">

          <div>

            <p className="text-violet-400 text-xs uppercase tracking-[0.3em] mb-3">
              Your Collection
            </p>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              Favourites
            </h1>

            <p className="text-gray-500 mt-3">
              {favourites.length}{" "}
              {favourites.length === 1
                ? "game"
                : "games"}{" "}
              you love.
            </p>

          </div>

          <button
            onClick={() => navigate("/search")}
            className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm font-medium"
          >
            + Discover Games
          </button>

        </div>

        {/* ==================================================
            GAME GRID
        ================================================== */}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">

          {favourites.map((favourite) => {

            const game = favourite.game;

            if (!game) {
              return null;
            }

            const cover = imageUrl(
              game.coverUrl,
              "t_cover_big"
            );

            return (
              <div
                key={favourite.id}
                className="group relative"
              >

                {/* Game card */}

                <button
                  type="button"
                  onClick={() =>
                    navigate(`/game/${game.id}`)
                  }
                  className="w-full text-left"
                >

                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-[#111116] shadow-xl">

                    {cover ? (
                      <img
                        src={cover}
                        alt={game.name}
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        No cover
                      </div>
                    )}

                    {/* Gradient */}

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

                    {/* Favourite indicator */}

                    <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-pink-400">
                      ♥
                    </div>

                    {/* Game name */}

                    <div className="absolute bottom-0 left-0 right-0 p-4">

                      <h2 className="font-bold text-base leading-tight line-clamp-2">
                        {game.name}
                      </h2>

                    </div>

                  </div>

                </button>

                {/* Remove button */}

                <button
                  type="button"
                  onClick={() =>
                    handleRemoveFavourite(game.id)
                  }
                  className="mt-3 w-full py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition"
                >
                  Remove Favourite
                </button>

              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
}