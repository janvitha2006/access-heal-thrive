import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { languages, useI18n, type Lang } from "../lib/i18n";
import { clearUser, getStoredUser, initialsOf, type CCUser } from "../lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Care Connect — Rural Healthcare Access & SOS" },
      {
        name: "description",
        content:
          "Care Connect helps rural communities find nearby public health facilities, check live doctor, bed and medicine availability, book appointments, start teleconsultations and raise an SOS emergency.",
      },
      { property: "og:title", content: "Care Connect — Rural Healthcare Access & SOS" },
      {
        property: "og:description",
        content:
          "Live availability of public health facilities, appointments, teleconsultation and one-tap SOS emergency for rural communities.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type FacilityStatus = "avail" | "limited" | "unavail";

function StatusBadge({ status, label }: { status: FacilityStatus; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${
        status === "avail" ? "text-avail" : status === "limited" ? "text-limited" : "text-unavail"
      }`}
    >
      <span
        className={`size-1.5 rounded-full shrink-0 ${
          status === "avail"
            ? "bg-avail status-pulse"
            : status === "limited"
              ? "bg-limited"
              : "bg-unavail"
        }`}
      />
      {label}
    </span>
  );
}

const facilities: {
  type: string;
  nameKey: string;
  status: FacilityStatus;
  onCall?: boolean;
  detailKey: string;
  distance: string;
  actionKey: "view" | "call";
}[] = [
  { type: "PHC", nameKey: "facPhc", status: "avail", detailKey: "facPhcDetail", distance: "2.4 km", actionKey: "view" },
  { type: "CHC", nameKey: "facChc", status: "limited", detailKey: "facChcDetail", distance: "6.1 km", actionKey: "view" },
  { type: "HSC", nameKey: "facHsc", status: "unavail", detailKey: "facHscDetail", distance: "9.8 km", actionKey: "view" },
  { type: "ASHA", nameKey: "facAsha", status: "avail", onCall: true, detailKey: "facAshaDetail", distance: "1.2 km", actionKey: "call" },
];

const timeSlots = ["10:00", "11:00", "11:30"];

const emergencyTypes = [
  { id: "accident", labelKey: "eAccident", hintKey: "eAccidentH" },
  { id: "cardiac", labelKey: "eCardiac", hintKey: "eCardiacH" },
  { id: "maternity", labelKey: "eMaternity", hintKey: "eMaternityH" },
  { id: "snakebite", labelKey: "eSnakebite", hintKey: "eSnakebiteH" },
  { id: "child", labelKey: "eChild", hintKey: "eChildH" },
  { id: "other", labelKey: "eOther", hintKey: "eOtherH" },
];

const medicines: { name: string; useKey: string; stock: number; unitKey: string }[] = [
  { name: "Paracetamol 500mg", useKey: "useFever", stock: 320, unitKey: "tablets" },
  { name: "ORS sachets", useKey: "useDehydration", stock: 84, unitKey: "packs" },
  { name: "Amoxicillin 250mg", useKey: "useInfection", stock: 12, unitKey: "strips" },
  { name: "Iron & folic acid", useKey: "useAnaemia", stock: 210, unitKey: "tablets" },
  { name: "Anti-venom serum", useKey: "useSnakebite", stock: 0, unitKey: "vials" },
  { name: "Metformin 500mg", useKey: "useDiabetes", stock: 46, unitKey: "strips" },
  { name: "Salbutamol inhaler", useKey: "useAsthma", stock: 5, unitKey: "units" },
];

const triage: { key: string; textKey: string; level: FacilityStatus }[] = [
  { key: "sym1", textKey: "sym1t", level: "limited" },
  { key: "sym2", textKey: "sym2t", level: "unavail" },
  { key: "sym3", textKey: "sym3t", level: "avail" },
  { key: "sym4", textKey: "sym4t", level: "limited" },
];

const records = [
  { date: "02 Mar", titleKey: "rec1", placeKey: "rec1p" },
  { date: "18 Feb", titleKey: "rec2", placeKey: "rec2p" },
  { date: "04 Jan", titleKey: "rec3", placeKey: "rec3p" },
];

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function Index() {
  const navigate = useNavigate();
  const { lang, setLang, t, speak, stop, speaking } = useI18n();
  const [user, setUser] = useState<CCUser | null>(null);
  const [checked, setChecked] = useState(false);

  const [slot, setSlot] = useState("10:00");
  const [sosOpen, setSosOpen] = useState(false);
  const [sosType, setSosType] = useState<string | null>(null);
  const [sosActive, setSosActive] = useState(false);
  const [eta, setEta] = useState(660);
  const [query, setQuery] = useState("");
  const [symptom, setSymptom] = useState<string | null>(null);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    const u = getStoredUser();
    if (!u) {
      navigate({ to: "/auth", replace: true });
      return;
    }
    setUser(u);
    setChecked(true);
  }, [navigate]);

  useEffect(() => {
    if (!sosActive) return;
    const id = setInterval(() => setEta((e) => (e > 0 ? e - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [sosActive]);

  const filteredMeds = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return medicines;
    return medicines.filter(
      (m) => m.name.toLowerCase().includes(q) || t(m.useKey).toLowerCase().includes(q),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, lang]);

  if (!checked || !user) return null;

  const statusText = (s: FacilityStatus) =>
    s === "avail" ? t("available") : s === "limited" ? t("limited") : t("full");

  const firstName = user.name.trim().split(/\s+/)[0] ?? user.name;
  const greeting = `${t("greeting").split(",")[0]}, ${firstName}`;

  function listenToPage() {
    if (speaking) {
      stop();
      return;
    }
    speak(
      [
        greeting,
        t("subtitle"),
        t("facTitle"),
        t("phcTitle"),
        `${t("doctors")}: ${t("drMeera")}, ${t("drRajan")}.`,
        t("sosDesc"),
      ].join(". "),
    );
  }

  function voiceSearch() {
    const w = window as unknown as Record<string, unknown>;
    const SR = (w["SpeechRecognition"] ?? w["webkitSpeechRecognition"]) as
      | (new () => {
          lang: string;
          onresult: (e: { results: { 0: { 0: { transcript: string } } } }) => void;
          onend: () => void;
          onerror: () => void;
          start: () => void;
        })
      | undefined;
    if (!SR) {
      toast.info(t("noVoice"));
      return;
    }
    const rec = new SR();
    rec.lang = languages.find((l) => l.code === lang)?.voice ?? "en-IN";
    rec.onresult = (e) => setQuery(e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    setListening(true);
    rec.start();
  }

  function raiseSos() {
    setSosActive(true);
    setEta(660);
    setSosOpen(false);
    toast.error(t("tSos"));
    speak(t("tSos"));
  }

  function signOut() {
    stop();
    clearUser();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-paper text-ink font-sans antialiased pb-24">
      <header className="bg-pine text-cream">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-cream grid place-items-center ring-1 ring-cream/30 shrink-0">
              <div className="size-6 rounded-full bg-pine grid place-items-center text-cream text-[11px] font-semibold tracking-wide">
                CC
              </div>
            </div>
            <div className="leading-none">
              <p className="font-display font-medium text-lg">{t("brand")}</p>
              <p className="text-cream/70 text-xs mt-0.5">{t("tagline")}</p>
            </div>
          </div>
          <nav aria-label="Main" className="hidden md:flex items-center gap-1 text-sm">
            <a href="#home" className="px-3 py-2 rounded-lg bg-cream/15 font-medium text-cream">
              {t("navHome")}
            </a>
            <a href="#facilities" className="px-3 py-2 rounded-lg text-cream/70 hover:text-cream">
              {t("navFacilities")}
            </a>
            <a href="#medicines" className="px-3 py-2 rounded-lg text-cream/70 hover:text-cream">
              {t("navMedicines")}
            </a>
            <a href="#book" className="px-3 py-2 rounded-lg text-cream/70 hover:text-cream">
              {t("navBook")}
            </a>
            <a href="#records" className="px-3 py-2 rounded-lg text-cream/70 hover:text-cream">
              {t("navRecords")}
            </a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <select
              aria-label={t("language")}
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              className="rounded-lg bg-cream/15 text-cream px-2 py-2 text-xs outline-none ring-1 ring-cream/25 [&>option]:text-ink"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={listenToPage}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-cream/15 px-3 py-2 text-xs font-medium ring-1 ring-cream/25 hover:bg-cream/25"
            >
              <span aria-hidden="true">{speaking ? "⏹" : "🔊"}</span>
              {speaking ? t("stop") : t("listen")}
            </button>
            <button
              type="button"
              onClick={() => setSosOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-unavail px-3 py-2 text-xs font-semibold text-cream hover:opacity-90"
            >
              {t("sos")}
            </button>
            <button
              type="button"
              onClick={signOut}
              title={user.name}
              aria-label={`${user.name} — sign out`}
              className="size-9 rounded-full bg-cream/20 grid place-items-center text-sm font-medium ring-1 ring-cream/30 hover:bg-cream/30"
            >
              {initialsOf(user.name)}
            </button>
          </div>
        </div>
      </header>

      {sosActive && (
        <div className="bg-unavail text-cream">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-2 font-semibold">
              <span className="size-2 rounded-full bg-cream status-pulse" />
              {t("sosActive")}
            </span>
            <span className="text-cream/85">
              {t("sosArrives")} {fmt(eta)} · {t("sosDriver")}
            </span>
            <button
              type="button"
              onClick={() => {
                setSosActive(false);
                toast.success(t("tSosClosed"));
              }}
              className="ml-auto rounded-lg bg-cream/20 px-3 py-1.5 text-xs font-medium hover:bg-cream/30"
            >
              {t("sosCancel")}
            </button>
          </div>
        </div>
      )}

      <main id="home" className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
        <section className="mb-8">
          <p className="text-[13px] text-pine font-medium tracking-wide">{t("date")}</p>
          <h1 className="text-balance font-display font-medium text-3xl sm:text-4xl leading-tight mt-1">
            {greeting}
          </h1>
          <p className="text-pretty text-ink/70 text-base mt-2 max-w-[52ch]">{t("subtitle")}</p>
          <button
            type="button"
            onClick={listenToPage}
            className="mt-3 inline-flex sm:hidden items-center gap-1.5 rounded-lg bg-pine text-cream px-3 py-2 text-xs font-medium"
          >
            <span aria-hidden="true">{speaking ? "⏹" : "🔊"}</span>
            {speaking ? t("stop") : t("listenPage")}
          </button>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section id="facilities" className="lg:col-span-2">
            <div className="bg-cream rounded-2xl ring-1 ring-black/5 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-display font-medium text-xl">{t("facTitle")}</h2>
                  <p className="text-ink/60 text-sm mt-0.5">{t("facSub")}</p>
                </div>
                <span className="text-xs font-medium text-pine bg-pine-soft rounded-full px-3 py-1 whitespace-nowrap">
                  {t("facCount")}
                </span>
              </div>
              <div className="space-y-3">
                {facilities.map((f) => (
                  <div
                    key={f.nameKey}
                    className="flex items-center gap-4 rounded-xl ring-1 ring-black/5 p-4"
                  >
                    <div
                      className={`size-11 rounded-xl grid place-items-center text-xs font-semibold shrink-0 ${
                        f.status === "avail"
                          ? "bg-avail/10 text-avail"
                          : f.status === "limited"
                            ? "bg-limited/10 text-limited"
                            : "bg-unavail/10 text-unavail"
                      }`}
                    >
                      {f.type}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{t(f.nameKey)}</p>
                        <StatusBadge
                          status={f.status}
                          label={f.onCall ? t("onCall") : statusText(f.status)}
                        />
                      </div>
                      <p className="text-ink/60 text-sm mt-0.5 truncate">{t(f.detailKey)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-semibold leading-none">{f.distance}</p>
                      <button
                        type="button"
                        onClick={() =>
                          f.actionKey === "call"
                            ? toast.info(t("tCallAsha"))
                            : toast.info(t("tOpening"))
                        }
                        className="mt-1 text-xs font-medium text-pine underline underline-offset-2"
                      >
                        {t(f.actionKey)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <section className="mt-6 bg-cream rounded-2xl ring-1 ring-black/5 p-5 sm:p-6">
              <h2 className="font-display font-medium text-xl mb-4">{t("phcTitle")}</h2>
              <p className="text-ink/55 text-xs uppercase tracking-[0.12em] mb-2">
                {t("doctors")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className="flex items-center justify-between rounded-xl ring-1 ring-black/5 p-4">
                  <div>
                    <p className="font-medium">{t("drMeera")}</p>
                    <p className="text-ink/60 text-sm mt-0.5">{t("drMeeraRole")}</p>
                  </div>
                  <StatusBadge status="avail" label={t("available")} />
                </div>
                <div className="flex items-center justify-between rounded-xl ring-1 ring-black/5 p-4">
                  <div>
                    <p className="font-medium">{t("drRajan")}</p>
                    <p className="text-ink/60 text-sm mt-0.5">{t("drRajanRole")}</p>
                  </div>
                  <StatusBadge status="avail" label={t("available")} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl ring-1 ring-black/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{t("beds")}</p>
                    <span className="text-xs font-medium text-avail">{t("plenty")}</span>
                  </div>
                  <p className="text-2xl font-semibold mt-1">8</p>
                  <p className="text-ink/55 text-xs mt-0.5">{t("bedsFree")}</p>
                </div>
                <div className="rounded-xl ring-1 ring-black/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{t("medicines")}</p>
                    <span className="text-xs font-medium text-limited">{t("lowStock")}</span>
                  </div>
                  <p className="text-2xl font-semibold mt-1">42</p>
                  <p className="text-ink/55 text-xs mt-0.5">{t("itemsInStock")}</p>
                </div>
                <div className="rounded-xl ring-1 ring-black/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{t("lab")}</p>
                    <span className="text-xs font-medium text-unavail">{t("closed")}</span>
                  </div>
                  <p className="text-2xl font-semibold mt-1">—</p>
                  <p className="text-ink/55 text-xs mt-0.5">{t("reopens")}</p>
                </div>
              </div>
            </section>

            <section
              id="medicines"
              className="mt-6 bg-cream rounded-2xl ring-1 ring-black/5 p-5 sm:p-6"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-display font-medium text-xl">{t("medTitle")}</h2>
                  <p className="text-ink/60 text-sm mt-0.5">{t("medSub")}</p>
                </div>
              </div>
              <label htmlFor="med-search" className="sr-only">
                {t("medSearch")}
              </label>
              <div className="flex gap-2">
                <input
                  id="med-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("medSearch")}
                  className="flex-1 rounded-xl ring-1 ring-black/10 bg-paper/60 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pine"
                />
                <button
                  type="button"
                  onClick={voiceSearch}
                  className="shrink-0 rounded-xl bg-pine text-cream px-4 py-3 text-xs font-semibold hover:opacity-90"
                >
                  {listening ? t("listening") : `🎙 ${t("speakSearch")}`}
                </button>
              </div>
              <div className="mt-4 space-y-2">
                {filteredMeds.map((m) => {
                  const level: FacilityStatus =
                    m.stock === 0 ? "unavail" : m.stock < 20 ? "limited" : "avail";
                  return (
                    <div
                      key={m.name}
                      className="flex items-center gap-3 rounded-xl ring-1 ring-black/5 px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{m.name}</p>
                        <p className="text-ink/60 text-xs mt-0.5">{t(m.useKey)}</p>
                      </div>
                      <StatusBadge
                        status={level}
                        label={m.stock === 0 ? t("outOfStock") : `${m.stock} ${t(m.unitKey)}`}
                      />
                      {m.stock === 0 && (
                        <button
                          type="button"
                          onClick={() => toast.info(t("tRequested"))}
                          className="text-xs font-medium text-pine underline underline-offset-2 shrink-0"
                        >
                          {t("request")}
                        </button>
                      )}
                    </div>
                  );
                })}
                {filteredMeds.length === 0 && (
                  <p className="text-ink/60 text-sm py-4">{t("noMatch")}</p>
                )}
              </div>
            </section>

            <section
              id="records"
              className="mt-6 bg-cream rounded-2xl ring-1 ring-black/5 p-5 sm:p-6"
            >
              <h2 className="font-display font-medium text-xl mb-4">{t("recTitle")}</h2>
              <div className="space-y-3">
                {records.map((r) => (
                  <div
                    key={r.titleKey}
                    className="flex items-center gap-4 rounded-xl ring-1 ring-black/5 p-4"
                  >
                    <div className="size-11 rounded-xl bg-pine-soft text-pine grid place-items-center text-[11px] font-semibold shrink-0">
                      {r.date.split(" ")[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{t(r.titleKey)}</p>
                      <p className="text-ink/60 text-xs mt-0.5 truncate">
                        {r.date} · {t(r.placeKey)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.info(t("tOpening"))}
                      className="text-xs font-medium text-pine underline underline-offset-2 shrink-0"
                    >
                      {t("open")}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </section>

          <aside className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl bg-unavail text-cream p-5 sm:p-6">
              <h2 className="font-display font-medium text-xl">{t("sosTitle")}</h2>
              <p className="text-cream/80 text-sm mt-1 mb-4 text-pretty">{t("sosDesc")}</p>
              <button
                type="button"
                onClick={() => setSosOpen(true)}
                className="sos-pulse w-full py-4 rounded-xl bg-cream text-unavail font-semibold text-base hover:bg-cream/90"
              >
                {t("sosRaise")}
              </button>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => toast.info(t("tCall108"))}
                  className="rounded-lg bg-cream/15 py-2.5 font-medium hover:bg-cream/25"
                >
                  {t("call108")}
                </button>
                <button
                  type="button"
                  onClick={() => toast.info(t("tShared"))}
                  className="rounded-lg bg-cream/15 py-2.5 font-medium hover:bg-cream/25"
                >
                  {t("shareLocation")}
                </button>
              </div>
            </div>

            <div className="bg-cream rounded-2xl ring-1 ring-black/5 p-5 sm:p-6">
              <h2 className="font-display font-medium text-xl mb-1">{t("symTitle")}</h2>
              <p className="text-ink/60 text-sm mb-3">{t("symSub")}</p>
              <div className="flex flex-wrap gap-2">
                {triage.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSymptom(s.key)}
                    aria-pressed={symptom === s.key}
                    className={`rounded-full px-3 py-2 text-xs font-medium ring-1 ${
                      symptom === s.key
                        ? "bg-pine text-cream ring-pine"
                        : "bg-paper/60 text-ink ring-black/10 hover:bg-paper"
                    }`}
                  >
                    {t(s.key)}
                  </button>
                ))}
              </div>
              {symptom && (
                <div className="mt-4 rounded-xl ring-1 ring-black/5 p-4">
                  <StatusBadge
                    status={triage.find((s) => s.key === symptom)!.level}
                    label={
                      triage.find((s) => s.key === symptom)!.level === "unavail"
                        ? t("urgent")
                        : triage.find((s) => s.key === symptom)!.level === "limited"
                          ? t("seeDoctor")
                          : t("routine")
                    }
                  />
                  <p className="text-sm text-ink/75 mt-2 text-pretty">
                    {t(triage.find((s) => s.key === symptom)!.textKey)}
                  </p>
                </div>
              )}
            </div>

            <div id="book" className="bg-pine text-cream rounded-2xl p-5 sm:p-6">
              <h2 className="font-display font-medium text-xl">{t("bookTitle")}</h2>
              <p className="text-cream/70 text-sm mt-1 mb-4">{t("bookSub")}</p>
              <div className="rounded-xl bg-cream/10 ring-1 ring-cream/20 p-4">
                <p className="text-xs text-cream/70 mb-2">{t("bookChoose")}</p>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((ts) => (
                    <button
                      key={ts}
                      type="button"
                      onClick={() => setSlot(ts)}
                      aria-pressed={slot === ts}
                      className={`py-2.5 rounded-lg text-sm font-medium ${
                        slot === ts
                          ? "bg-cream text-pine"
                          : "bg-cream/10 text-cream ring-1 ring-cream/20 hover:bg-cream/20"
                      }`}
                    >
                      {ts}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4 rounded-xl bg-cream/10 ring-1 ring-cream/20 p-3">
                <div className="size-10 rounded-lg bg-cream/15 grid place-items-center shrink-0 text-xs font-semibold">
                  ID
                </div>
                <p className="text-sm text-cream/85">{t("bookCard")}</p>
              </div>
              <button
                type="button"
                onClick={() => toast.success(t("tBooked"))}
                className="mt-4 w-full py-3 rounded-xl bg-cream text-pine font-semibold text-sm hover:bg-cream/90"
              >
                {t("bookConfirm")}
              </button>
            </div>

            <div className="bg-cream rounded-2xl ring-1 ring-black/5 p-5 sm:p-6">
              <h2 className="font-display font-medium text-xl mb-3">{t("teleTitle")}</h2>
              <p className="text-ink/65 text-sm text-pretty">{t("teleDesc")}</p>
              <button
                type="button"
                onClick={() => toast.info(t("tTele"))}
                className="mt-4 w-full py-3 rounded-xl bg-leaf text-cream font-semibold text-sm hover:bg-leaf/90"
              >
                {t("teleStart")}
              </button>
            </div>

            <div id="schemes" className="bg-cream rounded-2xl ring-1 ring-black/5 p-5 sm:p-6">
              <h2 className="font-display font-medium text-xl mb-3">{t("schemesTitle")}</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-pine-soft text-pine grid place-items-center text-[11px] font-semibold shrink-0">
                    AB
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{t("scheme1")}</p>
                    <p className="text-ink/60 text-xs">{t("scheme1d")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-limited/10 text-limited grid place-items-center text-[11px] font-semibold shrink-0">
                    JS
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{t("scheme2")}</p>
                    <p className="text-ink/60 text-xs">{t("scheme2d")}</p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toast.info(t("tElig"))}
                className="mt-4 text-sm font-medium text-pine underline underline-offset-2"
              >
                {t("checkElig")}
              </button>
            </div>
          </aside>
        </div>
      </main>

      <footer className="bg-pine text-cream/70">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p>{t("footer1")}</p>
          <p>{t("footer2")}</p>
        </div>
      </footer>

      <button
        type="button"
        onClick={() => setSosOpen(true)}
        className="sos-pulse fixed bottom-5 right-5 z-40 sm:hidden rounded-full bg-unavail text-cream font-semibold px-6 py-4 shadow-lg"
      >
        {t("sos")}
      </button>

      {sosOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("sosTitle")}
          className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-ink/50 p-0 sm:p-6"
        >
          <div className="w-full sm:max-w-md bg-cream rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display font-medium text-xl">{t("sosTitle")}</h2>
                <p className="text-ink/60 text-sm mt-1">{t("sosPlace")}</p>
              </div>
              <button
                type="button"
                onClick={() => setSosOpen(false)}
                className="text-sm text-ink/60 hover:text-ink"
              >
                {t("close")}
              </button>
            </div>

            <p className="text-ink/55 text-xs uppercase tracking-[0.12em] mt-5 mb-2">
              {t("sosWhat")}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {emergencyTypes.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setSosType(e.id)}
                  aria-pressed={sosType === e.id}
                  className={`text-left rounded-xl px-3 py-3 ring-1 ${
                    sosType === e.id
                      ? "bg-unavail text-cream ring-unavail"
                      : "bg-paper/60 ring-black/10 hover:bg-paper"
                  }`}
                >
                  <p className="text-sm font-medium">{t(e.labelKey)}</p>
                  <p
                    className={`text-xs mt-0.5 ${sosType === e.id ? "text-cream/75" : "text-ink/55"}`}
                  >
                    {t(e.hintKey)}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-xl ring-1 ring-black/5 p-4 text-sm text-ink/70">
              {t("sosAlerting")}
            </div>

            <button
              type="button"
              disabled={!sosType}
              onClick={raiseSos}
              className="mt-4 w-full py-4 rounded-xl bg-unavail text-cream font-semibold text-base disabled:opacity-50 hover:opacity-90"
            >
              {t("sosSend")}
            </button>
            <button
              type="button"
              onClick={() => toast.info(t("tCall108"))}
              className="mt-2 w-full py-3 rounded-xl ring-1 ring-black/10 font-medium text-sm hover:bg-paper"
            >
              {t("sosJustCall")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
