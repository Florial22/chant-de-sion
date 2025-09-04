import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Lyrics from "./pages/Lyrics";
import Favorites from "./pages/Favorites";
import Settings from "./pages/Settings";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import { SearchProvider } from "./store/search";
import { SettingsProvider } from "./store/settings";
import ErrorBoundary from "./components/ErrorBoundary";
import Explore from "./pages/Explore";
import { LibraryProvider } from "./store/library";

function Layout() {
  const { pathname } = useLocation();
  const isLyrics = pathname.startsWith("/song/"); // hide header search + bottom nav on Lyrics

  return (
    <div className="min-h-screen pb-20">
      {!isLyrics && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explorer" element={<Explore />} /> 
        <Route path="/favoris" element={<Favorites />} />
        <Route path="/reglages" element={<Settings />} />
        <Route path="/song/:id" element={<Lyrics />} />
      </Routes>
      {!isLyrics && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LibraryProvider>
        <SettingsProvider>
          <SearchProvider>
            <ErrorBoundary>
              <Layout />
            </ErrorBoundary>
          </SearchProvider>
        </SettingsProvider>
      </LibraryProvider>
    </BrowserRouter>
  );
}
