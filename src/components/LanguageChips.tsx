import { useSearch } from "../store/search";
import { useT } from "../lib/i18n";

const CHIP = (props: React.PropsWithChildren<{ active: boolean; onClick: () => void; disabled?: boolean }>) => (
  <button
    type="button"
    onClick={props.onClick}
    disabled={props.disabled}
    className="px-2.5 py-1 text-xs rounded-full border mr-1 mb-1 disabled:opacity-40"
    style={{
      background: props.active ? "#417956" : "#fff",
      color: props.active ? "#fff" : "#000",
      borderColor: "rgba(0,0,0,0.15)",
    }}
  >
    {props.children}
  </button>
);

export default function LanguageChips() {
  const { langFilter, setLangFilter } = useSearch();
  const t = useT();
  return (
    <div className="mb-3">
      <CHIP active={langFilter === "all"} onClick={() => setLangFilter("all")}>{t("chipsAll")}</CHIP>
      <CHIP active={langFilter === "fr"} onClick={() => setLangFilter("fr")}>{t("chipsFr")}</CHIP>
      <CHIP active={langFilter === "en"} onClick={() => setLangFilter("en")}>{t("chipsEn")}</CHIP>
      <CHIP active={langFilter === "ht"} onClick={() => setLangFilter("ht")}>{t("chipsHt")}</CHIP>
    </div>
  );
}
