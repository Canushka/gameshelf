import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function imageUrl(url) {
  if (!url) return null;

  let finalUrl = url;

  if (finalUrl.startsWith("//")) {
    finalUrl = "https:" + finalUrl;
  }

  return finalUrl.replace(
    /\/t_[^/]+\//,
    "/t_cover_big/"
  );
}

export default function Shelf() {
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadShelf() {
      try {
        const response = await api.get("/library");
        setGames(response.data);
      } catch (err) {
        console.error("Failed to load shelf:", err);
      } finally {
        setLoading(false);
      }
    }

    loadShelf();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080b] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-purple-400 text-sm uppercase tracking-[0.3em] mb-3">
            GameShelf
          </div>

          <div className="text-2xl font-bold">
            Loading your shelf...
          </div>
        </div>
      </div>
    );
  }

  const wishlist = games.filter(
    (item) => item.status === "WISHLIST"
  );

  const playing = games.filter(
    (item) => item.status === "PLAYING"
  );

  const completed = games.filter(
    (item) => item.status === "COMPLETED"
  );

  function GameSection({ title, items }) {
    if (items.length === 0) {
      return null;
    }

    return (
      <section className="mb-14">

        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {title}
          </h2>

          <span className="text-sm text-gray-500">
            {items.length}{" "}
            {items.length === 1 ? "game" : "games"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">

          {items.map((item) => {
            const game = item.game;
            const cover = imageUrl(game?.coverUrl);

            return (
              <button
                key={item.id}
                onClick={() =>
                  navigate(`/game/${game.id}`)
                }
                className="group text-left"
              >
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[#15151b] border border-white/10 mb-3">

                  {cover ? (
                    <img
                      src={cover}
                      alt={game.name}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 text-sm px-4 text-center">
                      No cover
                    </div>
                  )}

                </div>

                <h3 className="font-semibold truncate group-hover:text-purple-400 transition">
                  {game.name}
                </h3>

                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    {item.status}
                  </p>

                  <button
                    onClick={async (e) => {
                      e.stopPropagation();

                      const confirmed = window.confirm(
                        `Remove "${game.name}" from your shelf?`
                      );

                      if (!confirmed) return;

                      try {
                        await api.delete(`/library/${game.id}`);

                        setGames((current) =>
                          current.filter((g) => g.id !== item.id)
                        );
                      } catch (err) {
                        console.error("Failed to remove game:", err);
                        alert("Could not remove the game from your shelf.");
                      }
                    }}
                    className="text-xs text-red-400 hover:text-red-300 transition"
                  >
                    Remove
                  </button>
                </div>
              </button>
            );
          })}

        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080b] text-white">

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-12">

          <p className="text-purple-400 text-xs uppercase tracking-[0.3em] mb-3">
            Your collection
          </p>

          <h1 className="text-5xl font-black tracking-tight">
            My Shelf
          </h1>

          <p className="text-gray-500 mt-3">
            {games.length}{" "}
            {games.length === 1 ? "game" : "games"} in your collection
          </p>

        </div>

        {games.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#111116] p-16 text-center">

            <div className="text-5xl mb-5">
              🎮
            </div>

            <h2 className="text-2xl font-bold mb-3">
              Your shelf is empty
            </h2>

            <p className="text-gray-500 mb-7">
              Discover games and add them to your shelf.
            </p>

            <button
              onClick={() => navigate("/search")}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 transition font-semibold"
            >
              Discover Games
            </button>

          </div>
        ) : (
          <>
            <GameSection
              title="Wishlist"
              items={wishlist}
            />

            <GameSection
              title="Playing"
              items={playing}
            />

            <GameSection
              title="Completed"
              items={completed}
            />
          </>
        )}

      </div>

    </div>
  );
}