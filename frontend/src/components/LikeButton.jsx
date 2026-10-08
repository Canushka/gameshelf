import { useEffect, useState } from "react";
import api from "../services/api";

export default function LikeButton({ reviewId }) {
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    api.get(`/likes/${reviewId}/count`).then((res) => {
      setCount(res.data);
    });
  }, [reviewId]);

  const like = async () => {
    if (liked) return;
    await api.post(`/likes/${reviewId}`);
    setCount(count + 1);
    setLiked(true);
  };

  return (
    <button
      onClick={like}
      className={`flex items-center gap-2 px-3 py-1 rounded-lg transition ${
        liked
          ? "bg-violet-600 text-white"
          : "bg-slate-800 hover:bg-violet-600"
      }`}
    >
      ❤️ <span>{count}</span>
    </button>
  );
}
