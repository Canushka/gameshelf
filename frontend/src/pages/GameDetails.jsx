import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function formatDate(timestamp) {
  if (!timestamp) return "Unknown";

  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function imageUrl(url, size = "t_cover_big") {
  if (!url) return null;

  let finalUrl = url;

  if (finalUrl.startsWith("//")) {
    finalUrl = "https:" + finalUrl;
  }

  return finalUrl.replace(/\/t_[^/]+\//, `/${size}/`);
}

export default function GameDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ==================================================
  // GAME STATE
  // ==================================================

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================================================
  // SCREENSHOT STATE
  // ==================================================

  const [selectedScreenshot, setSelectedScreenshot] = useState(null);

  // ==================================================
  // SHELF STATE
  // ==================================================

  const [inShelf, setInShelf] = useState(false);
  const [shelfLoading, setShelfLoading] = useState(false);

  // ==================================================
  // FAVOURITE STATE
  // ==================================================

  const [isFavourite, setIsFavourite] = useState(false);
  const [favouriteLoading, setFavouriteLoading] = useState(false);

  // ==================================================
  // REVIEW STATE
  // ==================================================

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  // ==================================================
  // EDIT REVIEW STATE
  // ==================================================

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editText, setEditText] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // ==================================================
  // GET CURRENT USER EMAIL FROM JWT
  // ==================================================

  function getCurrentUserEmail() {
    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    try {
      const payloadPart = token.split(".")[1];

      if (!payloadPart) {
        return null;
      }

      const normalized = payloadPart
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      const payload = JSON.parse(atob(normalized));

      return payload.sub || null;
    } catch (err) {
      console.error("Failed to read user from token:", err);
      return null;
    }
  }

  // ==================================================
  // LOAD GAME
  // ==================================================

  useEffect(() => {
    async function fetchGame() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/games/${id}`);

        const data = Array.isArray(response.data)
          ? response.data[0]
          : response.data;

        if (!data) {
          throw new Error("Game not found");
        }

        setGame(data);
      } catch (err) {
        console.error("Failed to load game:", err);
        setError("Unable to load this game.");
      } finally {
        setLoading(false);
      }
    }

    // IMPORTANT:
    // The function is fetchGame(), not loadGame().
    fetchGame();
  }, [id]);

  // ==================================================
  // CHECK SHELF
  // ==================================================

  useEffect(() => {
    async function checkShelf() {
      try {
        const response = await api.get("/library");

        const exists = response.data.some(
          (item) => item.game?.id === Number(id)
        );

        setInShelf(exists);
      } catch (err) {
        console.error("Failed to check shelf:", err);
      }
    }

    checkShelf();
  }, [id]);

  // ==================================================
  // CHECK FAVOURITE
  // ==================================================

  useEffect(() => {
    async function checkFavourite() {
      try {
        const response = await api.get(`/favourites/${id}`);

        setIsFavourite(response.data);
      } catch (err) {
        console.error("Failed to check favourite:", err);
      }
    }

    checkFavourite();
  }, [id]);

  // ==================================================
  // LOAD REVIEWS
  // ==================================================

  useEffect(() => {
    async function loadReviews() {
      try {
        const [reviewsResponse, averageResponse] = await Promise.all([
          api.get(`/reviews/${id}`),
          api.get(`/reviews/${id}/average`),
        ]);

        setReviews(reviewsResponse.data);
        setAverageRating(Number(averageResponse.data) || 0);
      } catch (err) {
        console.error("Failed to load reviews:", err);
      }
    }

    loadReviews();
  }, [id]);

  // ==================================================
  // ADD TO SHELF
  // ==================================================

  async function handleAddToShelf() {
    if (!game || inShelf || shelfLoading) {
      return;
    }

    try {
      setShelfLoading(true);

      await api.post(`/library/${game.id}`, {
        name: game.name,
        summary: game.summary || "",
        coverUrl: game.cover?.url || "",
        releaseDate: game.first_release_date || null,
        status: "WISHLIST",
      });

      setInShelf(true);
    } catch (err) {
      console.error("Failed to add game to shelf:", err);

      if (err.response?.status === 409) {
        setInShelf(true);
      } else {
        alert("Could not add this game to your shelf.");
      }
    } finally {
      setShelfLoading(false);
    }
  }

  // ==================================================
  // TOGGLE FAVOURITE
  // ==================================================

  async function handleFavourite() {
    if (!game || favouriteLoading) {
      return;
    }

    try {
      setFavouriteLoading(true);

      if (isFavourite) {
        await api.delete(`/favourites/${game.id}`);

        setIsFavourite(false);
      } else {
        await api.post(`/favourites/${game.id}`, {
          name: game.name,
          summary: game.summary || "",
          coverUrl: game.cover?.url || "",
          releaseDate: game.first_release_date || null,
        });

        setIsFavourite(true);
      }
    } catch (err) {
      console.error("Failed to update favourite:", err);

      if (err.response?.status === 409) {
        setIsFavourite(true);
      } else {
        alert("Could not update your favourites.");
      }
    } finally {
      setFavouriteLoading(false);
    }
  }

  // ==================================================
  // SUBMIT REVIEW
  // ==================================================

  async function handleSubmitReview(e) {
    e.preventDefault();

    if (reviewRating === 0) {
      alert("Please select a rating.");
      return;
    }

    if (!reviewText.trim()) {
      alert("Please write a review.");
      return;
    }

    try {
      setReviewLoading(true);

      await api.post(`/reviews/${game.id}`, {
        rating: reviewRating,
        text: reviewText.trim(),
      });

      const [reviewsResponse, averageResponse] = await Promise.all([
        api.get(`/reviews/${game.id}`),
        api.get(`/reviews/${game.id}/average`),
      ]);

      setReviews(reviewsResponse.data);
      setAverageRating(Number(averageResponse.data) || 0);

      setReviewRating(0);
      setReviewText("");
    } catch (err) {
      console.error("Failed to submit review:", err);

      if (err.response?.status === 409) {
        alert("You have already reviewed this game.");
      } else {
        alert("Could not submit your review.");
      }
    } finally {
      setReviewLoading(false);
    }
  }

  // ==================================================
  // UPDATE REVIEW
  // ==================================================

  async function handleUpdateReview(reviewId) {
    if (editRating === 0) {
      alert("Please select a rating.");
      return;
    }

    if (!editText.trim()) {
      alert("Please write a review.");
      return;
    }

    try {
      setEditLoading(true);

      await api.put(`/reviews/${reviewId}`, {
        rating: editRating,
        text: editText.trim(),
      });

      const [reviewsResponse, averageResponse] = await Promise.all([
        api.get(`/reviews/${game.id}`),
        api.get(`/reviews/${game.id}/average`),
      ]);

      setReviews(reviewsResponse.data);
      setAverageRating(Number(averageResponse.data) || 0);

      setEditingReviewId(null);
      setEditRating(0);
      setEditText("");
    } catch (err) {
      console.error("Failed to update review:", err);

      if (err.response?.status === 403) {
        alert("You can only edit your own review.");
      } else {
        alert("Could not update your review.");
      }
    } finally {
      setEditLoading(false);
    }
  }

  // ==================================================
  // DELETE REVIEW
  // ==================================================

  async function handleDeleteReview(reviewId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete your review?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/reviews/${reviewId}`);

      const [reviewsResponse, averageResponse] = await Promise.all([
        api.get(`/reviews/${game.id}`),
        api.get(`/reviews/${game.id}/average`),
      ]);

      setReviews(reviewsResponse.data);
      setAverageRating(Number(averageResponse.data) || 0);

      if (editingReviewId === reviewId) {
        setEditingReviewId(null);
        setEditRating(0);
        setEditText("");
      }
    } catch (err) {
      console.error("Failed to delete review:", err);

      if (err.response?.status === 403) {
        alert("You can only delete your own review.");
      } else {
        alert("Could not delete your review.");
      }
    }
  }

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080b] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-purple-400 text-sm uppercase tracking-[0.3em] mb-3">
            GameShelf
          </div>

          <div className="text-2xl font-bold">
            Loading game...
          </div>
        </div>
      </div>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================

  if (error || !game) {
    return (
      <div className="min-h-screen bg-[#08080b] text-white flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-3">
            Game not found
          </h1>

          <p className="text-gray-400 mb-6">
            We couldn't load this game from IGDB.
          </p>

          <button
            onClick={() => navigate("/search")}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 transition font-semibold"
          >
            Back to Discover
          </button>
        </div>
      </div>
    );
  }

  // ==================================================
  // GAME DATA
  // ==================================================

  const cover = imageUrl(
    game.cover?.url,
    "t_cover_big"
  );

  const screenshots = (game.screenshots || [])
    .slice(0, 6)
    .map((screenshot) =>
      imageUrl(screenshot.url, "t_1080p")
    )
    .filter(Boolean);

  const genres = Array.isArray(game.genres)
    ? game.genres
    : [];

  const platforms = Array.isArray(game.platforms)
    ? game.platforms
    : [];

  const companies = Array.isArray(game.involved_companies)
    ? game.involved_companies
    : [];

  const developers = companies
    .filter((company) => company.developer)
    .map((company) => company.company?.name)
    .filter(Boolean);

  const publishers = companies
    .filter((company) => company.publisher)
    .map((company) => company.company?.name)
    .filter(Boolean);

  const currentUserEmail = getCurrentUserEmail();

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <div className="min-h-screen bg-[#08080b] text-white">

      {/* ==================================================
          BACK BUTTON
      ================================================== */}

      <div className="max-w-7xl mx-auto px-6 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white transition text-sm"
        >
          ← Back
        </button>
      </div>

      {/* ==================================================
          HERO
      ================================================== */}

      <section className="max-w-7xl mx-auto px-6 pt-8 pb-14">

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#111116]">

          {screenshots.length > 0 && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20 blur-sm scale-105"
              style={{
                backgroundImage: `url(${screenshots[0]})`,
              }}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-[#08080b] via-[#08080bcc] to-[#08080b99]" />

          <div className="relative grid md:grid-cols-[280px_1fr] gap-8 p-8 md:p-12">

            {/* Cover */}

            <div>
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[#19191f] border border-white/10 shadow-2xl">

                {cover ? (
                  <img
                    src={cover}
                    alt={game.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No cover available
                  </div>
                )}

              </div>
            </div>

            {/* Main information */}

            <div className="flex flex-col justify-end">

              <div className="text-purple-400 text-xs font-semibold uppercase tracking-[0.3em] mb-4">
                Game Details
              </div>

              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-5">
                {game.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-6">

                {game.rating != null && (
                  <div className="flex items-center gap-2">

                    <span className="text-yellow-400 text-xl">
                      ★
                    </span>

                    <span className="font-bold text-lg">
                      {Number(game.rating).toFixed(1)}
                    </span>

                    <span className="text-gray-500">
                      / 100
                    </span>

                  </div>
                )}

                {game.rating != null && (
                  <span className="text-gray-500">
                    •
                  </span>
                )}

                <span className="text-gray-300">
                  {formatDate(game.first_release_date)}
                </span>

              </div>

              {/* Genres */}

              {genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-7">

                  {genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}

                </div>
              )}

              {/* Buttons */}

              <div className="flex flex-wrap gap-3">

                {/* Shelf */}

                <button
                  onClick={handleAddToShelf}
                  disabled={inShelf || shelfLoading}
                  className={`px-6 py-3 rounded-xl transition font-semibold ${
                    inShelf
                      ? "bg-green-600/20 text-green-400 border border-green-500/30 cursor-default"
                      : "bg-purple-600 hover:bg-purple-500 text-white"
                  }`}
                >
                  {shelfLoading
                    ? "Adding..."
                    : inShelf
                      ? "✓ In Shelf"
                      : "+ Add to Shelf"}
                </button>

                {/* Favourite */}

                <button
                  onClick={handleFavourite}
                  disabled={favouriteLoading}
                  className={`px-6 py-3 rounded-xl transition font-semibold border ${
                    isFavourite
                      ? "bg-pink-500/20 text-pink-400 border-pink-500/30"
                      : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {favouriteLoading
                    ? "Saving..."
                    : isFavourite
                      ? "♥ Added to Favourites"
                      : "♡ Favourite"}
                </button>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ==================================================
          DESCRIPTION + METADATA
      ================================================== */}

      <section className="max-w-7xl mx-auto px-6 pb-14">

        <div className="grid lg:grid-cols-[1fr_320px] gap-10">

          {/* Description */}

          <div>

            <h2 className="text-2xl font-bold mb-4">
              About the game
            </h2>

            <p className="text-gray-400 leading-8 text-lg">
              {game.summary ||
                game.storyline ||
                "No description is available for this game."}
            </p>

          </div>

          {/* Metadata */}

          <div className="rounded-2xl border border-white/10 bg-[#111116] p-6">

            <h2 className="font-bold text-lg mb-6">
              Information
            </h2>

            {/* Platforms */}

            {platforms.length > 0 && (
              <div className="mb-6">

                <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">
                  Platforms
                </div>

                <div className="text-gray-300 leading-7">
                  {platforms
                    .map((platform) => platform.name)
                    .join(", ")}
                </div>

              </div>
            )}

            {/* Developers */}

            {developers.length > 0 && (
              <div className="mb-6">

                <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">
                  Developer
                </div>

                <div className="text-gray-300">
                  {developers.join(", ")}
                </div>

              </div>
            )}

            {/* Publishers */}

            {publishers.length > 0 && (
              <div>

                <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">
                  Publisher
                </div>

                <div className="text-gray-300">
                  {publishers.join(", ")}
                </div>

              </div>
            )}

          </div>

        </div>

      </section>

      {/* ==================================================
          RATINGS & REVIEWS
      ================================================== */}

      <section className="max-w-7xl mx-auto px-6 pb-20">

        <div className="mb-8">

          <p className="text-purple-400 text-xs uppercase tracking-[0.25em] mb-2">
            Community
          </p>

          <h2 className="text-3xl font-bold">
            Ratings & Reviews
          </h2>

        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">

          {/* Rating summary */}

          <div className="rounded-2xl border border-white/10 bg-[#111116] p-7 h-fit">

            <div className="text-sm text-gray-500 mb-3">
              Community rating
            </div>

            <div className="text-5xl font-black mb-3">
              {Number(averageRating).toFixed(1)}

              <span className="text-xl text-gray-500 font-medium">
                / 5
              </span>
            </div>

            <div className="flex text-yellow-400 text-xl mb-3">

              {Array.from({ length: 5 }).map((_, index) => (
                <span key={index}>
                  {index < Math.round(Number(averageRating))
                    ? "★"
                    : "☆"}
                </span>
              ))}

            </div>

            <div className="text-sm text-gray-500">
              {reviews.length}{" "}
              {reviews.length === 1
                ? "review"
                : "reviews"}
            </div>

          </div>

          {/* Review form + reviews */}

          <div>

            {/* WRITE REVIEW */}

            <form
              onSubmit={handleSubmitReview}
              className="rounded-2xl border border-white/10 bg-[#111116] p-7 mb-8"
            >

              <h3 className="text-xl font-bold mb-5">
                Rate this game
              </h3>

              {/* Star selector */}

              <div className="flex items-center gap-2 mb-5">

                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className={`text-3xl transition ${
                      star <= reviewRating
                        ? "text-yellow-400"
                        : "text-gray-600 hover:text-yellow-300"
                    }`}
                    aria-label={`Rate ${star} out of 5`}
                  >
                    ★
                  </button>
                ))}

                {reviewRating > 0 && (
                  <span className="text-sm text-gray-400 ml-2">
                    {reviewRating}/5
                  </span>
                )}

              </div>

              {/* Review text */}

              <textarea
                value={reviewText}
                onChange={(e) =>
                  setReviewText(e.target.value)
                }
                placeholder="What did you think about this game?"
                rows={5}
                maxLength={2000}
                className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none"
              />

              <div className="flex justify-between items-center mt-4">

                <span className="text-xs text-gray-600">
                  {reviewText.length}/2000
                </span>

                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 transition font-semibold"
                >
                  {reviewLoading
                    ? "Posting..."
                    : "Post Review"}
                </button>

              </div>

            </form>

            {/* REVIEWS */}

            <div className="space-y-4">

              {reviews.length === 0 ? (

                <div className="rounded-2xl border border-white/10 bg-[#111116] p-10 text-center">

                  <p className="text-gray-500">
                    No reviews yet. Be the first to
                    review this game.
                  </p>

                </div>

              ) : (

                reviews.map((review) => {

                  const isOwnReview =
                    review.user?.email &&
                    currentUserEmail &&
                    review.user.email === currentUserEmail;

                  const isEditing =
                    editingReviewId === review.id;

                  return (
                    <div
                      key={review.id}
                      className="rounded-2xl border border-white/10 bg-[#111116] p-6"
                    >

                      {/* Review header */}

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <div className="font-semibold">
                            {review.user?.username ||
                              "Anonymous"}
                          </div>

                          {!isEditing && (
                            <div className="flex text-yellow-400 mt-1">

                              {Array.from({
                                length: 5,
                              }).map((_, index) => (
                                <span key={index}>
                                  {index < review.rating
                                    ? "★"
                                    : "☆"}
                                </span>
                              ))}

                            </div>
                          )}

                        </div>

                        {review.createdAt && (
                          <span className="text-xs text-gray-600">
                            {new Date(
                              review.createdAt
                            ).toLocaleDateString()}
                          </span>
                        )}

                      </div>

                      {/* EDIT MODE */}

                      {isEditing ? (

                        <div className="mt-5">

                          {/* Edit rating */}

                          <div className="flex items-center gap-2 mb-4">

                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() =>
                                  setEditRating(star)
                                }
                                className={`text-3xl transition ${
                                  star <= editRating
                                    ? "text-yellow-400"
                                    : "text-gray-600 hover:text-yellow-300"
                                }`}
                                aria-label={`Edit rating to ${star} out of 5`}
                              >
                                ★
                              </button>
                            ))}

                            <span className="text-sm text-gray-400 ml-2">
                              {editRating}/5
                            </span>

                          </div>

                          {/* Edit text */}

                          <textarea
                            value={editText}
                            onChange={(e) =>
                              setEditText(e.target.value)
                            }
                            maxLength={2000}
                            rows={4}
                            className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none"
                          />

                          {/* Edit buttons */}

                          <div className="flex gap-3 mt-4">

                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateReview(
                                  review.id
                                )
                              }
                              disabled={editLoading}
                              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 transition font-semibold"
                            >
                              {editLoading
                                ? "Saving..."
                                : "Save Changes"}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingReviewId(null);
                                setEditRating(0);
                                setEditText("");
                              }}
                              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition font-semibold"
                            >
                              Cancel
                            </button>

                          </div>

                        </div>

                      ) : (

                        /* NORMAL REVIEW */

                        <>

                          <p className="text-gray-400 leading-7 mt-4">
                            {review.text}
                          </p>

                          {/* Edit/Delete */}

                          {isOwnReview && (
                            <div className="flex gap-4 mt-5">

                              <button
                                type="button"
                                onClick={() => {
                                  setEditingReviewId(
                                    review.id
                                  );

                                  setEditRating(
                                    review.rating
                                  );

                                  setEditText(
                                    review.text || ""
                                  );
                                }}
                                className="text-sm text-purple-400 hover:text-purple-300 transition"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteReview(
                                    review.id
                                  )
                                }
                                className="text-sm text-red-400 hover:text-red-300 transition"
                              >
                                Delete
                              </button>

                            </div>
                          )}

                        </>

                      )}

                    </div>
                  );
                })

              )}

            </div>

          </div>

        </div>

      </section>

      {/* ==================================================
          SCREENSHOTS
      ================================================== */}

      {screenshots.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-20">

          <div className="flex items-end justify-between mb-6">

            <div>

              <p className="text-purple-400 text-xs uppercase tracking-[0.25em] mb-2">
                Visuals
              </p>

              <h2 className="text-2xl font-bold">
                Screenshots
              </h2>

            </div>

            <span className="text-sm text-gray-500">
              Click to expand
            </span>

          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

            {screenshots.map((screenshot, index) => (

              <button
                key={index}
                type="button"
                onClick={() =>
                  setSelectedScreenshot(screenshot)
                }
                className="group relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-[#111116] text-left focus:outline-none focus:ring-2 focus:ring-purple-500"
              >

                <img
                  src={screenshot}
                  alt={`${game.name} screenshot ${index + 1}`}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105 group-hover:brightness-110"
                />

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-300" />

                <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-xs text-white opacity-0 group-hover:opacity-100 transition duration-300">
                  Click to expand
                </div>

              </button>

            ))}

          </div>

        </section>
      )}

      {/* ==================================================
          SCREENSHOT LIGHTBOX
      ================================================== */}

      {selectedScreenshot && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          onClick={() => setSelectedScreenshot(null)}
        >

          <button
            type="button"
            onClick={() =>
              setSelectedScreenshot(null)
            }
            className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white text-2xl transition"
            aria-label="Close screenshot"
          >
            ×
          </button>

          <img
            src={selectedScreenshot}
            alt={`${game.name} screenshot enlarged`}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />

        </div>
      )}

    </div>
  );
}