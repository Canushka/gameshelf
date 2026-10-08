import { useNavigate } from "react-router-dom";

export default function Card({ game }) {
  const navigate = useNavigate();

  const releaseYear = game.firstReleaseDate
    ? new Date(game.firstReleaseDate * 1000).getFullYear()
    : null;

  return (
    <div
      onClick={() => navigate(`/game/${game.id}`)}
      className="
        group
        cursor-pointer
        overflow-hidden
        rounded-2xl
        bg-zinc-900
        border border-zinc-800
        hover:border-violet-500/60
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-[0_10px_40px_rgba(124,58,237,0.18)]
      "
    >
      {/* Cover */}
      <div className="aspect-[2/3] overflow-hidden bg-zinc-800">
        {game.coverUrl ? (
          <img
            src={game.coverUrl}
            alt={game.name}
            className="
              w-full
              h-full
              object-cover
              transition-transform
              duration-500
              group-hover:scale-105
            "
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-violet-950">
            <span className="text-zinc-500 text-sm text-center px-4">
              No cover available
            </span>
          </div>
        )}
      </div>

      {/* Game information */}
      <div className="p-4">
        <h3
          className="
            font-semibold
            text-white
            line-clamp-2
            group-hover:text-violet-400
            transition
          "
        >
          {game.name}
        </h3>

        {releaseYear && (
          <p className="text-sm text-zinc-500 mt-2">
            {releaseYear}
          </p>
        )}
      </div>
    </div>
  );
}