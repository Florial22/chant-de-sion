// src/pages/Welcome.tsx
import { useNavigate } from "react-router-dom";
import { useFirstRun } from "../store/firstRun";

export default function Welcome() {
  const nav = useNavigate();
  const { markOnboarded } = useFirstRun();

  function start() {
    markOnboarded();
    nav("/", { replace: true });
  }

  return (
    <div className="safe-top min-h-screen flex items-center justify-center px-4" style={{ background: "#e2eee4" }}>
      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-sm text-center">
        <div className="text-2xl font-semibold mb-1" style={{ color: "#67C090" }}>Bienvenue👋</div>
        <div className="text-sm mb-4 leading-relaxed" style={{ color: "rgba(0,0,0,0.65)" }}>
        Découvrez, cherchez et partagez vos cantiques facilement.
        <br />
        « Chantez à l'Éternel un cantique nouveau ».
            <br />
        Que chaque mélodie soit une prière et un enseignement pour votre cœur.
            <br />
         🎶✨
        </div>

        <button
          onClick={start}
          className="w-full rounded-xl px-4 py-2 font-medium shadow-sm border"
          style={{ background: "#67C090", color: "#fff", borderColor: "transparent" }}
        >
          Commencer
        </button>
      </div>
    </div>
  );
}
