import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import AdminBanner from "./pages/AdminBanner";

import Home from "./pages/Home";
import Lyrics from "./pages/Lyrics";
import Favorites from "./pages/Favorites";
import Settings from "./pages/Settings";
import Live from "./pages/Live";  
import Explore from "./pages/Explore";
import Welcome from "./pages/Welcome";

import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import ErrorBoundary from "./components/ErrorBoundary";

import { SearchProvider } from "./store/search";
import { SettingsProvider } from "./store/settings";
import { LibraryProvider } from "./store/library";
import { readJSON } from "./lib/storage";
import SplashGate from "./components/SplashGate";

import { PrayerProvider } from "./store/prayer";
import PrayerScheduler from "./components/PrayerScheduler";
import NotificationBridge from "./components/NotificationBridge";
import Prayer from "./pages/Prayer";
import { initNotificationChannels } from "./lib/notificationsInit";
import PrayerNow from "./pages/PrayerNow";

function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isLyrics = pathname.startsWith("/song/");
  const isWelcome = pathname === "/welcome";
  const hideChrome = isLyrics || isWelcome;

  // One-time welcome flow: check localStorage each time so it's never stale
  useEffect(() => {
    const onboarded = !!readJSON<boolean>("cds:onboarded:v1", false);
    if (!onboarded && !isWelcome) {
      navigate("/welcome", { replace: true });
    } else if (onboarded && isWelcome) {
      navigate("/", { replace: true });
    }
  }, [isWelcome, pathname, navigate]);

  useEffect(() => { initNotificationChannels(); }, []);

  return (
    <div className="min-h-screen pb-20">
      {!hideChrome && <Header />}
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/" element={<Home />} />
        <Route path="/explorer" element={<Explore />} />
         <Route path="/live" element={<Live />} /> 
        <Route path="/favoris" element={<Favorites />} />
        <Route path="/reglages" element={<Settings />} />
        <Route path="/song/:id" element={<Lyrics />} />
        <Route path="/priere" element={<Prayer />} />
        <Route path="/admin/banner" element={<AdminBanner />} />
        <Route path="/priere/maintenant" element={<PrayerNow />} />
      </Routes>
      {!hideChrome && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LibraryProvider>
        <SettingsProvider>
          <PrayerProvider>
          <SearchProvider>
            <ErrorBoundary>
              <SplashGate />
              <PrayerScheduler />     
              <NotificationBridge />
              <Layout />
            </ErrorBoundary>
          </SearchProvider>
          </PrayerProvider>
        </SettingsProvider>
      </LibraryProvider>
    </BrowserRouter>
  );
}
