import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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

const statusLabel: Record<FacilityStatus, string> = {
  avail: "Available",
  limited: "Limited",
  unavail: "Full today",
};

function StatusBadge({ status, label }: { status: FacilityStatus; label?: string | undefined }) {
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
      {label ?? statusLabel[status]}
    </span>
  );
}

const facilities: {
  type: string;
  name: string;
  status: FacilityStatus;
  statusText?: string;
  detail: string;
  distance: string;
  action: string;
}[] = [
  {
    type: "PHC",
    name: "Chitravad PHC",
    status: "avail",
    detail: "GP 2 · 3 beds · OR · Dispensary",
    distance: "2.4 km",
    action: "View",
  },
  {
    type: "CHC",
    name: "Gharsoda CHC",
    status: "limited",
    detail: "GP, Med Officer, Lab · 2 cots",
    distance: "6.1 km",
    action: "View",
  },
  {
    type: "HSC",
    name: "Kosad Health Centre",
    status: "unavail",
    detail: "Physio, ENT · Maternity cot booked",
    distance: "9.8 km",
    action: "View",
  },
  {
    type: "ASHA",
    name: "Suresh, ASHA Worker",
    status: "avail",
    statusText: "On call",
    detail: "Home visits · Mother & child care",
    distance: "1.2 km",
    action: "Call",
  },
];

const timeSlots = ["10:00", "11:00", "11:30"];

const emergencyTypes = [
  { id: "accident", label: "Accident / injury", hint: "Trauma, bleeding, fall" },
  { id: "cardiac", label: "Chest pain", hint: "Heart attack, breathlessness" },
  { id: "maternity", label: "Maternity", hint: "Labour, pregnancy emergency" },
  { id: "snakebite", label: "Snake bite / poison", hint: "Anti-venom needed" },
  { id: "child", label: "Child emergency", hint: "High fever, seizure" },
  { id: "other", label: "Other", hint: "Describe on the call" },
];

const medicines: { name: string; use: string; stock: number; unit: string }[] = [
  { name: "Paracetamol 500mg", use: "Fever, pain", stock: 320, unit: "tablets" },
  { name: "ORS sachets", use: "Dehydration", stock: 84, unit: "packs" },
  { name: "Amoxicillin 250mg", use: "Infection", stock: 12, unit: "strips" },
  { name: "Iron & folic acid", use: "Anaemia, pregnancy", stock: 210, unit: "tablets" },
  { name: "Anti-venom serum", use: "Snake bite", stock: 0, unit: "vials" },
  { name: "Metformin 500mg", use: "Diabetes", stock: 46, unit: "strips" },
  { name: "Salbutamol inhaler", use: "Asthma", stock: 5, unit: "units" },
];

const triageAnswers: Record<string, { level: FacilityStatus; text: string }> = {
  "Fever over 3 days": {
    level: "limited",
    text: "Visit Chitravad PHC today. Carry your Ayushman card. Drink ORS meanwhile.",
  },
  "Chest pain / breathless": {
    level: "unavail",
    text: "This can be an emergency. Raise SOS now — do not travel alone.",
  },
  "Pregnancy check-up": {
    level: "avail",
    text: "ANC check-ups run 10 am – 1 pm at the PHC. Suresh (ASHA) can accompany you.",
  },
  "Cut or wound": {
    level: "limited",
    text: "Clean with water, cover the wound and reach the HSC for a tetanus shot.",
  },
};

const records = [
  { date: "02 Mar", title: "Blood test — Haemoglobin 11.2", place: "Gharsoda CHC lab" },
  { date: "18 Feb", title: "Prescription — Iron + folic acid", place: "Dr. Meera Patel" },
  { date: "04 Jan", title: "ANC visit 2 · BP normal", place: "Chitravad PHC" },
];

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function Index() {
  const [slot, setSlot] = useState("10:00");
  const [sosOpen, setSosOpen] = useState(false);
  const [sosType, setSosType] = useState<string | null>(null);
  const [sosActive, setSosActive] = useState(false);
  const [eta, setEta] = useState(660);
  const [query, setQuery] = useState("");
  const [symptom, setSymptom] = useState<string | null>(null);

  useEffect(() => {
    if (!sosActive) return;
    const id = setInterval(() => setEta((e) => (e > 0 ? e - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [sosActive]);

  const filteredMeds = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return medicines;
    return medicines.filter(
      (m) => m.name.toLowerCase().includes(q) || m.use.toLowerCase().includes(q),
    );
  }, [query]);

  function raiseSos() {
    setSosActive(true);
    setEta(660);
    setSosOpen(false);
    toast.error("SOS sent · 108 ambulance dispatched to Arandol, Junagadh");
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
              <p className="font-display font-medium text-lg">Care Connect</p>
              <p className="text-cream/70 text-xs mt-0.5">Rural Public Health Network</p>
            </div>
          </div>
          <nav aria-label="Main" className="hidden md:flex items-center gap-1 text-sm">
            <a href="#home" className="px-3 py-2 rounded-lg bg-cream/15 font-medium text-cream">
              Home
            </a>
            <a href="#facilities" className="px-3 py-2 rounded-lg text-cream/70 hover:text-cream">
              Facilities
            </a>
            <a href="#medicines" className="px-3 py-2 rounded-lg text-cream/70 hover:text-cream">
              Medicines
            </a>
            <a href="#book" className="px-3 py-2 rounded-lg text-cream/70 hover:text-cream">
              Book
            </a>
            <a href="#records" className="px-3 py-2 rounded-lg text-cream/70 hover:text-cream">
              Records
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSosOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-unavail px-3 py-2 text-xs font-semibold text-cream hover:opacity-90"
            >
              SOS
            </button>
            <div
              className="size-9 rounded-full bg-cream/20 grid place-items-center text-sm font-medium ring-1 ring-cream/30"
              aria-label="Signed in as Rekha K"
            >
              RK
            </div>
          </div>
        </div>
      </header>

      {sosActive && (
        <div className="bg-unavail text-cream">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-2 font-semibold">
              <span className="size-2 rounded-full bg-cream status-pulse" />
              SOS active · ambulance GJ-11-AZ-2043
            </span>
            <span className="text-cream/85">Arrives in {fmt(eta)} · driver Kiran, 108</span>
            <button
              type="button"
              onClick={() => {
                setSosActive(false);
                toast.success("SOS closed. Take care, Rekha.");
              }}
              className="ml-auto rounded-lg bg-cream/20 px-3 py-1.5 text-xs font-medium hover:bg-cream/30"
            >
              Cancel SOS
            </button>
          </div>
        </div>
      )}

      <main id="home" className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
        <section className="mb-8">
          <p className="text-[13px] text-pine font-medium tracking-wide">Wednesday, 12 March</p>
          <h1 className="text-balance font-display font-medium text-3xl sm:text-4xl leading-tight mt-1">
            Namaste, Rekha
          </h1>
          <p className="text-pretty text-ink/70 text-base mt-2 max-w-[52ch]">
            Your Ayushman Bharat card is active. Here is what is open today near you.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section id="facilities" className="lg:col-span-2">
            <div className="bg-cream rounded-2xl ring-1 ring-black/5 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-display font-medium text-xl">Nearest facilities</h2>
                  <p className="text-ink/60 text-sm mt-0.5">Updated 8:45 am · live status</p>
                </div>
                <span className="text-xs font-medium text-pine bg-pine-soft rounded-full px-3 py-1 whitespace-nowrap">
                  4 within 12 km
                </span>
              </div>
              <div className="space-y-3">
                {facilities.map((f) => (
                  <div
                    key={f.name}
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
                        <p className="font-medium truncate">{f.name}</p>
                        <StatusBadge status={f.status} label={f.statusText} />
                      </div>
                      <p className="text-ink/60 text-sm mt-0.5 truncate">{f.detail}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-semibold leading-none">{f.distance}</p>
                      <button
                        type="button"
                        onClick={() =>
                          f.action === "Call"
                            ? toast.info("Calling Suresh (ASHA worker)…")
                            : toast.info(`Opening ${f.name} details…`)
                        }
                        className="mt-1 text-xs font-medium text-pine underline underline-offset-2"
                      >
                        {f.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <section className="mt-6 bg-cream rounded-2xl ring-1 ring-black/5 p-5 sm:p-6">
              <h2 className="font-display font-medium text-xl mb-4">Today at Chitravad PHC</h2>
              <p className="text-ink/55 text-xs uppercase tracking-[0.12em] mb-2">Doctors</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className="flex items-center justify-between rounded-xl ring-1 ring-black/5 p-4">
                  <div>
                    <p className="font-medium">Dr. Meera Patel</p>
                    <p className="text-ink/60 text-sm mt-0.5">General physician · 10 am – 1 pm</p>
                  </div>
                  <StatusBadge status="avail" />
                </div>
                <div className="flex items-center justify-between rounded-xl ring-1 ring-black/5 p-4">
                  <div>
                    <p className="font-medium">Rajan, Medical Officer</p>
                    <p className="text-ink/60 text-sm mt-0.5">Emergency · on duty</p>
                  </div>
                  <StatusBadge status="avail" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl ring-1 ring-black/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Beds</p>
                    <span className="text-xs font-medium text-avail">Plenty</span>
                  </div>
                  <p className="text-2xl font-semibold mt-1">8</p>
                  <p className="text-ink/55 text-xs mt-0.5">of 14 cots free</p>
                </div>
                <div className="rounded-xl ring-1 ring-black/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Medicines</p>
                    <span className="text-xs font-medium text-limited">Low stock</span>
                  </div>
                  <p className="text-2xl font-semibold mt-1">42</p>
                  <p className="text-ink/55 text-xs mt-0.5">common items in stock</p>
                </div>
                <div className="rounded-xl ring-1 ring-black/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Lab</p>
                    <span className="text-xs font-medium text-unavail">Closed</span>
                  </div>
                  <p className="text-2xl font-semibold mt-1">—</p>
                  <p className="text-ink/55 text-xs mt-0.5">Reopens Friday</p>
                </div>
              </div>
            </section>

            <section
              id="medicines"
              className="mt-6 bg-cream rounded-2xl ring-1 ring-black/5 p-5 sm:p-6"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-display font-medium text-xl">Medicine stock</h2>
                  <p className="text-ink/60 text-sm mt-0.5">Chitravad PHC dispensary · live count</p>
                </div>
              </div>
              <label htmlFor="med-search" className="sr-only">
                Search medicines
              </label>
              <input
                id="med-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a medicine or symptom, e.g. fever"
                className="w-full rounded-xl ring-1 ring-black/10 bg-paper/60 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pine"
              />
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
                        <p className="text-ink/60 text-xs mt-0.5">{m.use}</p>
                      </div>
                      <StatusBadge
                        status={level}
                        label={
                          m.stock === 0 ? "Out of stock" : `${m.stock} ${m.unit}`
                        }
                      />
                      {m.stock === 0 && (
                        <button
                          type="button"
                          onClick={() => toast.info(`Requested ${m.name} from Gharsoda CHC store`)}
                          className="text-xs font-medium text-pine underline underline-offset-2 shrink-0"
                        >
                          Request
                        </button>
                      )}
                    </div>
                  );
                })}
                {filteredMeds.length === 0 && (
                  <p className="text-ink/60 text-sm py-4">
                    Nothing matches “{query}”. Ask the pharmacist on 1800-114-114.
                  </p>
                )}
              </div>
            </section>

            <section
              id="records"
              className="mt-6 bg-cream rounded-2xl ring-1 ring-black/5 p-5 sm:p-6"
            >
              <h2 className="font-display font-medium text-xl mb-4">Your health records</h2>
              <div className="space-y-3">
                {records.map((r) => (
                  <div
                    key={r.title}
                    className="flex items-center gap-4 rounded-xl ring-1 ring-black/5 p-4"
                  >
                    <div className="size-11 rounded-xl bg-pine-soft text-pine grid place-items-center text-[11px] font-semibold shrink-0">
                      {r.date.split(" ")[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{r.title}</p>
                      <p className="text-ink/60 text-xs mt-0.5 truncate">
                        {r.date} · {r.place}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.info(`Opening record: ${r.title}`)}
                      className="text-xs font-medium text-pine underline underline-offset-2 shrink-0"
                    >
                      Open
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </section>

          <aside className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl bg-unavail text-cream p-5 sm:p-6">
              <h2 className="font-display font-medium text-xl">Emergency SOS</h2>
              <p className="text-cream/80 text-sm mt-1 mb-4 text-pretty">
                One tap alerts the 108 ambulance, the nearest facility and your ASHA worker with
                your location.
              </p>
              <button
                type="button"
                onClick={() => setSosOpen(true)}
                className="sos-pulse w-full py-4 rounded-xl bg-cream text-unavail font-semibold text-base hover:bg-cream/90"
              >
                Raise SOS
              </button>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => toast.info("Calling 108 ambulance…")}
                  className="rounded-lg bg-cream/15 py-2.5 font-medium hover:bg-cream/25"
                >
                  Call 108
                </button>
                <button
                  type="button"
                  onClick={() => toast.info("Location shared with Suresh (ASHA worker)")}
                  className="rounded-lg bg-cream/15 py-2.5 font-medium hover:bg-cream/25"
                >
                  Share location
                </button>
              </div>
            </div>

            <div className="bg-cream rounded-2xl ring-1 ring-black/5 p-5 sm:p-6">
              <h2 className="font-display font-medium text-xl mb-1">Quick symptom check</h2>
              <p className="text-ink/60 text-sm mb-3">Guidance only — not a diagnosis.</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(triageAnswers).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSymptom(s)}
                    aria-pressed={symptom === s}
                    className={`rounded-full px-3 py-2 text-xs font-medium ring-1 ${
                      symptom === s
                        ? "bg-pine text-cream ring-pine"
                        : "bg-paper/60 text-ink ring-black/10 hover:bg-paper"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {symptom && (
                <div className="mt-4 rounded-xl ring-1 ring-black/5 p-4">
                  <StatusBadge
                    status={triageAnswers[symptom]!.level}
                    label={
                      triageAnswers[symptom]!.level === "unavail"
                        ? "Urgent"
                        : triageAnswers[symptom]!.level === "limited"
                          ? "See a doctor"
                          : "Routine"
                    }
                  />
                  <p className="text-sm text-ink/75 mt-2 text-pretty">
                    {triageAnswers[symptom]!.text}
                  </p>
                </div>
              )}
            </div>

            <div id="book" className="bg-pine text-cream rounded-2xl p-5 sm:p-6">
              <h2 className="font-display font-medium text-xl">Book an appointment</h2>
              <p className="text-cream/70 text-sm mt-1 mb-4">Chitravad PHC · with Dr. Meera Patel</p>
              <div className="rounded-xl bg-cream/10 ring-1 ring-cream/20 p-4">
                <p className="text-xs text-cream/70 mb-2">Choose a time · 13 March</p>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSlot(t)}
                      aria-pressed={slot === t}
                      className={`py-2.5 rounded-lg text-sm font-medium ${
                        slot === t
                          ? "bg-cream text-pine"
                          : "bg-cream/10 text-cream ring-1 ring-cream/20 hover:bg-cream/20"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4 rounded-xl bg-cream/10 ring-1 ring-cream/20 p-3">
                <div className="size-10 rounded-lg bg-cream/15 grid place-items-center shrink-0 text-xs font-semibold">
                  ID
                </div>
                <p className="text-sm text-cream/85">Ayushman Bharat card · verified by ASHA</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  toast.success(`Appointment booked for 13 March at ${slot} with Dr. Meera Patel`)
                }
                className="mt-4 w-full py-3 rounded-xl bg-cream text-pine font-semibold text-sm hover:bg-cream/90"
              >
                Confirm booking
              </button>
            </div>

            <div className="bg-cream rounded-2xl ring-1 ring-black/5 p-5 sm:p-6">
              <h2 className="font-display font-medium text-xl mb-3">Talk to a doctor now</h2>
              <p className="text-ink/65 text-sm text-pretty">
                Video or phone consult for follow-up and general questions.
              </p>
              <button
                type="button"
                onClick={() => toast.info("Connecting you to the teleconsultation queue…")}
                className="mt-4 w-full py-3 rounded-xl bg-leaf text-cream font-semibold text-sm hover:bg-leaf/90"
              >
                Start teleconsultation
              </button>
            </div>

            <div id="schemes" className="bg-cream rounded-2xl ring-1 ring-black/5 p-5 sm:p-6">
              <h2 className="font-display font-medium text-xl mb-3">Your schemes</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-pine-soft text-pine grid place-items-center text-[11px] font-semibold shrink-0">
                    AB
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm">Ayushman Bharat</p>
                    <p className="text-ink/60 text-xs">₹5 lakh cover · active</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-limited/10 text-limited grid place-items-center text-[11px] font-semibold shrink-0">
                    JS
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm">JS-Yojana</p>
                    <p className="text-ink/60 text-xs">Free GP + medicines</p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toast.info("Checking your scheme eligibility…")}
                className="mt-4 text-sm font-medium text-pine underline underline-offset-2"
              >
                Check my eligibility
              </button>
            </div>
          </aside>
        </div>
      </main>

      <footer className="bg-pine text-cream/70">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p>Care Connect · a public service prototype</p>
          <p>Helpline 1800-114-114 · Ambulance 108 · 24 hours</p>
        </div>
      </footer>

      <button
        type="button"
        onClick={() => setSosOpen(true)}
        className="sos-pulse fixed bottom-5 right-5 z-40 sm:hidden rounded-full bg-unavail text-cream font-semibold px-6 py-4 shadow-lg"
      >
        SOS
      </button>

      {sosOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Emergency SOS"
          className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-ink/50 p-0 sm:p-6"
        >
          <div className="w-full sm:max-w-md bg-cream rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display font-medium text-xl">Emergency SOS</h2>
                <p className="text-ink/60 text-sm mt-1">
                  Arandol, Junagadh · location will be shared
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSosOpen(false)}
                className="text-sm text-ink/60 hover:text-ink"
              >
                Close
              </button>
            </div>

            <p className="text-ink/55 text-xs uppercase tracking-[0.12em] mt-5 mb-2">
              What happened?
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
                  <p className="text-sm font-medium">{e.label}</p>
                  <p
                    className={`text-xs mt-0.5 ${sosType === e.id ? "text-cream/75" : "text-ink/55"}`}
                  >
                    {e.hint}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-xl ring-1 ring-black/5 p-4 text-sm text-ink/70">
              Alerting: 108 ambulance · Chitravad PHC · Suresh (ASHA) · family contact Kiran K.
            </div>

            <button
              type="button"
              disabled={!sosType}
              onClick={raiseSos}
              className="mt-4 w-full py-4 rounded-xl bg-unavail text-cream font-semibold text-base disabled:opacity-50 hover:opacity-90"
            >
              Send SOS now
            </button>
            <button
              type="button"
              onClick={() => toast.info("Calling 108 ambulance…")}
              className="mt-2 w-full py-3 rounded-xl ring-1 ring-black/10 font-medium text-sm hover:bg-paper"
            >
              Just call 108 instead
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
