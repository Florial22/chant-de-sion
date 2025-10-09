import { useSettings } from "../store/settings";

type Keys =
  | "home" | "explore" | "live" | "favorites" | "settings"
  | "searchPlaceholder"
  | "loading"
  | "noneFound" | "noneMatch"
  | "liveHeader" | "verifiedAt" | "noLiveNow" | "noStreams"
  | "badgeLiveNow" | "badgeOffline"
  | "uiLanguageLabel" | "uiLanguageFr" | "uiLanguageEn" | "uiLanguagelabel"
  | "preferredLanguageContent" | "preferredLanguagelabel" | "textsize"
  | "reinitialize" | "appversion" | "homeRsultfor" | "exploreSongsLoading"
  | "exploreSongscount" | "exploreNosongs"
  | "chipsAll" | "chipsFr" | "chipsEn" | "chipsHt"
  | "exploreforward" | "exploreback" | "explorePage"
  | "watchLive" | "liveloading" | "notavaiableFlux" | "unaabletochargelive"
  | "faoritesLoading" | "favoritesNoSongs" | "appName"
  |  "channels" | "channelsHeader" | "visitChannel" | "channelsEmpty" | "unableToLoadChannels" 
  | "appAcronym";
const M: Record<"fr" | "en", Record<Keys, string>> = {
  fr: {
    home: "Accueil",
    explore: "Explorer",
    live: "Live",
    favorites: "Favoris",
    settings: "Réglages",
    searchPlaceholder: "Rechercher par titre ou paroles…",
    loading: "Chargement…",
    noneFound: "Aucun chant trouvé.",
    noneMatch: "Aucun chant ne correspond à votre recherche.",
    liveHeader: "En direct",
    verifiedAt: "Vérifié",
    watchLive: "Regarder",
    noLiveNow: "Aucun direct en cours pour le moment.",
    noStreams: "Aucun flux disponible.",
    badgeLiveNow: "EN DIRECT",
    badgeOffline: "Hors ligne",
    uiLanguageLabel: "Langue de l’interface",
    uiLanguagelabel: "Change la langue des menus, étiquettes et messages de l’application.",
    uiLanguageFr: "Français",
    uiLanguageEn: "Anglais",
    preferredLanguageContent: "Langue préférée (contenu)",
    preferredLanguagelabel: "Utilisée comme valeur par défaut pour la recherche et l’ouverture des paroles.",
    textsize: "Taille du texte par défaut (lecture)",
    reinitialize : "valider",
    appversion: "Version de l’app",
    homeRsultfor: "Résultats pour",
    exploreSongsLoading: "Chargement des chants…",
    exploreSongscount: "chants",
    exploreNosongs: "Aucun chant pour cette langue.",
    chipsAll: "Tous",
    chipsFr: "FR",
    chipsEn: "EN",
    chipsHt: "HT",
    exploreforward: "suivante",
    exploreback: "précédente",
    explorePage: "page",
    liveloading: "Chargement des directs…",
    notavaiableFlux: "Aucun flux disponible.",
    unaabletochargelive: "Impossible de charger les directs.",
    faoritesLoading: "Chargement des favoris…",
    favoritesNoSongs: "Vous n’avez pas encore de favoris.",
    appName: "Chant de Sion",
    appAcronym: "C.D.S",
    channels: "Chaînes",
    channelsHeader: "Chaînes YouTube",
    visitChannel: "Visiter la chaîne",
    channelsEmpty: "Aucune chaîne disponible.",
    unableToLoadChannels: "Impossible de charger la liste des chaînes.",

  },
  en: {
    home: "Home",
    explore: "Explore",
    live: "Live",
    favorites: "Favorites",
    settings: "Settings",
    searchPlaceholder: "Search by title or lyrics…",
    loading: "Loading…",
    noneFound: "No songs found.",
    noneMatch: "No songs match your search.",
    liveHeader: "Live",
    verifiedAt: "Checked",
    noLiveNow: "No live streams right now.",
    noStreams: "No streams available.",
    badgeLiveNow: "LIVE NOW",
    badgeOffline: "Offline",
    uiLanguageLabel: "Interface language",
    uiLanguagelabel: "Change the language of the app’s menus, labels and messages.",
    uiLanguageFr: "French",
    uiLanguageEn: "English",
    preferredLanguageContent: "Preferred language (content)",
    preferredLanguagelabel: "Used as the default for searching and opening lyrics.",
    textsize: "Default text size (reading)",
    reinitialize : "validate",
    appversion: "App version",
    homeRsultfor: "Results for",
    exploreSongsLoading: "Loading songs…",
    exploreSongscount: "songs",
    exploreNosongs: "No songs for this language.",
    chipsAll: "All",
    chipsFr: "FR",
    chipsEn: "EN",
    chipsHt: "HT",
    exploreforward: "next",
    exploreback: "previous",
    explorePage: "page",
    watchLive: "Watch",
    liveloading: "Loading live streams…",
    notavaiableFlux: "No streams available.",
    unaabletochargelive: "Unable to load live streams.",
    faoritesLoading: "Loading favorites…",
    favoritesNoSongs: "You don't have any favorites yet.",
    appName: "Song of Zion",
    appAcronym: "S.O.Z",
    channels: "Channels",
    channelsHeader: "YouTube Channels",
    visitChannel: "Visit channel",
    channelsEmpty: "No channels available.",
    unableToLoadChannels: "Unable to load channels list.",
  },
};

export function useT() {
  const { settings } = useSettings();
  const lang = (settings.uiLanguage ?? "fr") as "fr" | "en";
  return (k: Keys) => (M[lang][k] ?? M.fr[k] ?? k);
}
