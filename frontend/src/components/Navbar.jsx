import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const linkClass = (path) =>
    `relative text-sm font-medium transition-all duration-300 ${
      isActive(path)
        ? "text-white"
        : "text-zinc-500 hover:text-white"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#08080c]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-6">

        {/* LOGO */}
        <Link
          to="/search"
          className="group flex items-center text-xl font-bold tracking-[-0.04em]"
        >
          <span className="text-white">
            Game
          </span>

          <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Shelf
          </span>
        </Link>


        {/* NAVIGATION */}
        <div className="hidden items-center gap-8 md:flex">

          <Link
            to="/search"
            className={linkClass("/search")}
          >
            Discover

            {isActive("/search") && (
              <span className="absolute -bottom-[26px] left-0 right-0 mx-auto h-[2px] rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.7)]" />
            )}
          </Link>


          <Link
            to="/shelf"
            className={linkClass("/shelf")}
          >
            My Shelf

            {isActive("/shelf") && (
              <span className="absolute -bottom-[26px] left-0 right-0 mx-auto h-[2px] rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.7)]" />
            )}
          </Link>


          <Link
            to="/favourites"
            className={linkClass("/favourites")}
          >
            Favourites

            {isActive("/favourites") && (
              <span className="absolute -bottom-[26px] left-0 right-0 mx-auto h-[2px] rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.7)]" />
            )}
          </Link>


          <Link
            to="/feed"
            className={linkClass("/feed")}
          >
            Feed

            {isActive("/feed") && (
              <span className="absolute -bottom-[26px] left-0 right-0 mx-auto h-[2px] rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.7)]" />
            )}
          </Link>

        </div>


        {/* LOGOUT */}
        <button
          onClick={logout}
          className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-400 transition-all duration-300 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
        >
          Logout
        </button>

      </div>
    </nav>
  );
}