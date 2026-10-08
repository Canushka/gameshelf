import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function imageUrl(url, size = "t_cover_big") {
  if (!url) return null;

  let finalUrl = url;

  if (finalUrl.startsWith("//")) {
    finalUrl = "https:" + finalUrl;
  }

  return finalUrl.replace(
    /\/t_[^/]+\//,
    `/${size}/`
  );
}

function formatDate(date) {
  if (!date) return "";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return value.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRelativeDate(date) {
  if (!date) return "";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  const now = new Date();
  const difference =
    now.getTime() - value.getTime();

  const minutes = Math.floor(
    difference / (1000 * 60)
  );

  const hours = Math.floor(
    difference / (1000 * 60 * 60)
  );

  const days = Math.floor(
    difference / (1000 * 60 * 60 * 24)
  );

  if (minutes < 1) {
    return "just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return formatDate(date);
}

export default function Feed() {

  const navigate = useNavigate();

  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================================================
  // LOAD FEED
  // ==================================================

  useEffect(() => {

    async function loadFeed() {

      try {

        setLoading(true);
        setError("");

        const response = await api.get("/feed");

        const data = Array.isArray(response.data)
          ? response.data
          : [];

        setFeed(data);

      } catch (err) {

        console.error(
          "Failed to load feed:",
          err
        );

        if (err.response?.status === 401) {
          setError(
            "Your session has expired. Please log in again."
          );
        } else {
          setError(
            "Could not load the community feed."
          );
        }

      } finally {

        setLoading(false);

      }
    }

    loadFeed();

  }, []);

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {

    return (
      <div className="min-h-screen bg-[#08080c] text-white">

        <div className="max-w-6xl mx-auto px-6 py-14">

          <div className="mb-10">

            <p className="text-violet-400 text-xs uppercase tracking-[0.3em] mb-3">
              Community
            </p>

            <h1 className="text-4xl md:text-5xl font-black">
              Feed
            </h1>

            <p className="text-gray-500 mt-3">
              Loading the latest activity...
            </p>

          </div>

          <div className="space-y-5">

            {[1, 2, 3].map((item) => (

              <div
                key={item}
                className="rounded-3xl border border-white/10 bg-[#111116] p-6 animate-pulse"
              >

                <div className="flex gap-5">

                  <div className="w-14 h-14 rounded-full bg-white/5" />

                  <div className="flex-1">

                    <div className="h-4 w-48 bg-white/5 rounded mb-3" />

                    <div className="h-5 w-64 bg-white/5 rounded mb-5" />

                    <div className="h-20 bg-white/5 rounded-xl" />

                  </div>

                </div>

              </div>

            ))}

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

        <div className="max-w-6xl mx-auto px-6 py-14">

          <div className="mb-10">

            <p className="text-violet-400 text-xs uppercase tracking-[0.3em] mb-3">
              Community
            </p>

            <h1 className="text-4xl md:text-5xl font-black">
              Feed
            </h1>

          </div>

          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-10 text-center">

            <div className="text-red-400 font-semibold text-lg mb-3">
              Something went wrong
            </div>

            <p className="text-gray-500 mb-7">
              {error}
            </p>

            <button
              onClick={() =>
                window.location.reload()
              }
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
  // EMPTY FEED
  // ==================================================

  if (feed.length === 0) {

    return (
      <div className="min-h-screen bg-[#08080c] text-white">

        <div className="max-w-6xl mx-auto px-6 py-14">

          <div className="mb-10">

            <p className="text-violet-400 text-xs uppercase tracking-[0.3em] mb-3">
              Community
            </p>

            <h1 className="text-4xl md:text-5xl font-black">
              Feed
            </h1>

          </div>

          <div className="min-h-[420px] rounded-3xl border border-white/10 bg-[#111116] flex items-center justify-center">

            <div className="text-center max-w-md px-6">

              <div className="text-6xl mb-6">
                ◌
              </div>

              <h2 className="text-2xl font-bold mb-3">
                The feed is quiet
              </h2>

              <p className="text-gray-500 leading-7 mb-8">
                Reviews from the GameShelf community
                will appear here. Be the first person
                to share what you think about a game.
              </p>

              <button
                onClick={() =>
                  navigate("/search")
                }
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
  // FEED
  // ==================================================

  return (
    <div className="min-h-screen bg-[#08080c] text-white">

      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">

          <div>

            <p className="text-violet-400 text-xs uppercase tracking-[0.3em] mb-3">
              Community
            </p>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              Feed
            </h1>

            <p className="text-gray-500 mt-3">
              See what the GameShelf community is playing
              and reviewing.
            </p>

          </div>

          <button
            onClick={() =>
              navigate("/search")
            }
            className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm font-medium"
          >
            Discover Games
          </button>

        </div>

        {/* FEED */}

        <div className="max-w-4xl space-y-5">

          {feed.map((item) => {

            const cover = imageUrl(
              item.coverUrl,
              "t_cover_big"
            );

            return (
              <article
                key={item.reviewId}
                className="group rounded-3xl border border-white/10 bg-[#111116] overflow-hidden hover:border-violet-500/20 transition duration-300"
              >

                <div className="p-6 md:p-7">

                  {/* USER HEADER */}

                  <div className="flex items-start justify-between gap-4 mb-6">

                    <div className="flex items-center gap-4">

                      {/* Avatar */}

                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">

                        {item.username
                          ?.charAt(0)
                          ?.toUpperCase() || "?"}

                      </div>

                      <div>

                        <div className="font-semibold">
                          {item.username ||
                            "Anonymous"}
                        </div>

                        <div className="text-sm text-gray-600">
                          reviewed a game
                        </div>

                      </div>

                    </div>

                    <div className="text-xs text-gray-600">
                      {formatRelativeDate(
                        item.createdAt
                      )}
                    </div>

                  </div>

                  {/* GAME */}

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/game/${item.gameId}`
                      )
                    }
                    className="w-full text-left"
                  >

                    <div className="flex gap-5 p-4 rounded-2xl bg-black/20 border border-white/5 group-hover:bg-white/[0.025] transition">

                      {/* COVER */}

                      <div className="w-20 sm:w-24 shrink-0 aspect-[3/4] rounded-xl overflow-hidden bg-[#19191f] border border-white/10">

                        {cover ? (

                          <img
                            src={cover}
                            alt={item.gameName}
                            className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                          />

                        ) : (

                          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                            No cover
                          </div>

                        )}

                      </div>

                      {/* GAME INFO */}

                      <div className="min-w-0 flex-1 py-1">

                        <div className="text-xs uppercase tracking-[0.2em] text-violet-400 mb-2">
                          Review
                        </div>

                        <h2 className="text-xl font-bold truncate group-hover:text-violet-300 transition">
                          {item.gameName}
                        </h2>

                        {/* RATING */}

                        <div className="flex items-center gap-3 mt-3">

                          <div className="flex text-yellow-400 text-lg">

                            {Array.from({
                              length: 5,
                            }).map((_, index) => (

                              <span key={index}>
                                {index <
                                item.rating
                                  ? "★"
                                  : "☆"}
                              </span>

                            ))}

                          </div>

                          <span className="text-sm text-gray-500">
                            {item.rating}/5
                          </span>

                        </div>

                      </div>

                    </div>

                  </button>

                  {/* REVIEW TEXT */}

                  {item.text && (

                    <div className="mt-6">

                      <div className="relative">

                        <span className="absolute -top-3 -left-1 text-4xl text-violet-500/30 font-serif">
                          “
                        </span>

                        <p className="pl-5 text-gray-300 leading-8 text-[15px]">
                          {item.text}
                        </p>

                      </div>

                    </div>

                  )}

                  {/* FOOTER */}

                  <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/5">

                    <span className="text-xs text-gray-600">
                      {formatDate(item.createdAt)}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/game/${item.gameId}`
                        )
                      }
                      className="text-sm text-violet-400 hover:text-violet-300 transition"
                    >
                      View Game →
                    </button>

                  </div>

                </div>

              </article>
            );
          })}

        </div>

      </div>

    </div>
  );
}