import type { MouseEvent } from "react";
import { useFavorites } from "../store/favorites";

type Props = {
  songId: string;
  className?: string;
};

export default function FavoriteButton({ songId, className }: Props) {
  const { isFav, toggle } = useFavorites();
  const active = isFav(songId);

  const onClick = (e: MouseEvent) => {
    // prevent navigating the card link when pressing the star
    e.stopPropagation();
    e.preventDefault();
    toggle(songId);
  };

  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      title={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={`rounded-full border border-black/10 bg-white/90 backdrop-blur px-2.5 py-1 text-sm shadow-sm hover:shadow ${className ?? ""}`}
      style={{ color: active ? "#417956" : "#000" }}
    >
      {active ? "★" : "☆"}
    </button>
  );
}
