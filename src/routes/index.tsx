import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Arandol Health Kendra — Rural Healthcare Access" },
      {
        name: "description",
        content:
          "Find nearby public health facilities, check live doctor, bed and medicine availability, book appointments and start teleconsultations in rural and underserved areas.",
      },
      { property: "og:title", content: "Arandol Health Kendra — Rural Healthcare Access" },
      {
        property: "og:description",
        content:
          "Live availability of public health facilities, appointments and teleconsultation for rural communities.",
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

function StatusBadge({ status, label }: { status: FacilityStatus; label?: string }) {
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

function Index() {
  const [slot, setSlot] = useState("10:00");

  return (
    <div className="min-h-screen bg-paper text-ink font-sans antialiased">
      <header className="bg-pine text-cream">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-cream grid place-items-center ring-1 ring-cream/30 shrink-0">
              <div className="size-6 rounded-full bg-pine grid place-items-center text-cream text-[11px] font-semibold tracking-wide">
                AH
              </div>
            </div>
            <div className="leading-none">
              <p className="font-display font-medium text-lg">Arandol Health Kendra</p>
              <p className="text-cream/70 text-xs mt-0.5">Saurashtra Public Health Network</p>
            </div>
          </div>
          <nav aria-label="Main" className="hidden md:flex items-center gap-1 text-sm">
            <a href="#home" className="px-3 py-2 rounded-lg bg-cream/15 font-medium text-cream">
              Home
            </a>
            <a href="#facilities" className="px-3 py-2 rounded-lg text-cream/70 hover:text-cream">
              Find a facility
            </a>
            <a href="#book" className="px-3 py-2 rounded-lg text-cream/70 hover:text-cream">
              Book
            </a>
            <a href="#schemes" className="px-3 py-2 rounded-lg text-cream/70 hover:text-cream">
              Schemes
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-cream/10 rounded-lg px-3 py-2">
              <div className="size-2 rounded-full bg-cream/80 shrink-0" />
              <span className="text-xs text-cream/90">Arandol, Junagadh</span>
            </div>
            <div
              className="size-9 rounded-full bg-cream/20 grid place-items-center text-sm font-medium ring-1 ring-cream/30"
              aria-label="Signed in as Rekha K"
            >
              RK
            </div>
          </div>
        </div>
      </header>

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
                  <div key={f.name} className="flex items-center gap-4 rounded-xl ring-1 ring-black/5 p-4">
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
          </section>

          <aside className="lg:col-span-1 space-y-6">
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
          <p>Arandol Health Kendra · a public service prototype</p>
          <p>Helpline 1800-114-114 · 24 hours</p>
        </div>
      </footer>
    </div>
  );
}
