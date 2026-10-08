import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Search from "./pages/Search";
import Feed from "./pages/Feed";
import GameDetails from "./pages/GameDetails";
import Shelf from "./pages/Shelf";
import Favourites from "./pages/Favourites";
import Navbar from "./components/Navbar";

export default function App() {
  const token = localStorage.getItem("token");

  // Not logged in
  if (!token) {
    return <Login onLogin={() => window.location.reload()} />;
  }

  return (
    <>
      <Navbar />

      <Routes>

        {/* Default */}
        <Route
          path="/"
          element={<Navigate to="/search" replace />}
        />

        {/* Discover */}
        <Route
          path="/search"
          element={<Search />}
        />

        {/* Game Details */}
        <Route
          path="/game/:id"
          element={<GameDetails />}
        />

        {/* My Shelf */}
        <Route
          path="/shelf"
          element={<Shelf />}
        />

        {/* Favourites */}
        <Route
          path="/favourites"
          element={<Favourites />}
        />

        {/* Feed */}
        <Route
          path="/feed"
          element={<Feed />}
        />

        {/* Unknown route */}
        <Route
          path="*"
          element={<Navigate to="/search" replace />}
        />

      </Routes>
    </>
  );
}