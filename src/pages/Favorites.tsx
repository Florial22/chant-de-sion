import { useMemo } from "react";
import { useFavorites } from "../store/favorites";
import { useLibrary } from "../store/library";
import SongCard from "../components/SongCard";

export default function Favorites() {
  const { songs, status } = useLibrary();
  const { ids } = useFavorites();

  const favSongs = useMemo(
    () => songs.filter((s) => ids.includes(s.id)),
    [songs, ids]
  );

  if (status === "loading") {
    return <div className="safe-top px-4 pb-6">Chargement des favoris…</div>;
  }

  return (
    <div className="safe-top px-4 pb-6" style={{ paddingBottom: "calc(64px + var(--safe-bottom))" }}>
      <h1 className="text-base font-semibold mb-2" style={{ color:"#000" }}>
        Favoris
      </h1>

      {favSongs.length === 0 ? (
        <p className="text-black/70">Vous n’avez pas encore de favoris.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {favSongs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      )}
    </div>
  );
}
