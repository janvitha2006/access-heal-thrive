import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { languages, useI18n, type Lang } from "../lib/i18n";
import { getStoredUser, storeUser, type CCUser } from "../lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Register or sign in — Care Connect" },
      {
        name: "description",
        content:
          "Create your Care Connect account with your name, mobile number and village to see health facilities near you.",
      },
      { property: "og:title", content: "Register or sign in — Care Connect" },
      {
        property: "og:description",
        content:
          "Create your Care Connect account with your name, mobile number and village to see health facilities near you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const authText: Record<
  Lang,
  {
    welcome: string;
    welcomeSub: string;
    register: string;
    login: string;
    name: string;
    namePh: string;
    phone: string;
    phonePh: string;
    village: string;
    villagePh: string;
    langLabel: string;
    pin: string;
    pinPh: string;
    createBtn: string;
    loginBtn: string;
    haveAccount: string;
    noAccount: string;
    errFill: string;
    errPhone: string;
    errPin: string;
    errNoUser: string;
    errWrongPin: string;
    okRegister: string;
    okLogin: string;
  }
> = {
  en: {
    welcome: "Welcome to Care Connect",
    welcomeSub: "Register once with your mobile number. Your ASHA worker can help you fill this.",
    register: "Register",
    login: "Sign in",
    name: "Full name",
    namePh: "e.g. Rekha Kumari",
    phone: "Mobile number",
    phonePh: "10-digit mobile number",
    village: "Village",
    villagePh: "e.g. Arandol, Junagadh",
    langLabel: "Preferred language",
    pin: "4-digit PIN",
    pinPh: "Choose a PIN you remember",
    createBtn: "Create my account",
    loginBtn: "Sign in",
    haveAccount: "Already registered? Sign in",
    noAccount: "New here? Register",
    errFill: "Please fill every field.",
    errPhone: "Enter a valid 10-digit mobile number.",
    errPin: "PIN must be exactly 4 digits.",
    errNoUser: "No account found for this number. Please register first.",
    errWrongPin: "Wrong PIN. Try again.",
    okRegister: "Account created. Welcome!",
    okLogin: "Welcome back!",
  },
  hi: {
    welcome: "केयर कनेक्ट में आपका स्वागत है",
    welcomeSub: "अपने मोबाइल नंबर से एक बार रजिस्टर करें। आपकी आशा कार्यकर्ता मदद कर सकती हैं।",
    register: "रजिस्टर करें",
    login: "साइन इन",
    name: "पूरा नाम",
    namePh: "जैसे रेखा कुमारी",
    phone: "मोबाइल नंबर",
    phonePh: "10 अंकों का मोबाइल नंबर",
    village: "गाँव",
    villagePh: "जैसे अरंडोल, जूनागढ़",
    langLabel: "पसंदीदा भाषा",
    pin: "4 अंकों का पिन",
    pinPh: "ऐसा पिन चुनें जो याद रहे",
    createBtn: "मेरा खाता बनाएँ",
    loginBtn: "साइन इन करें",
    haveAccount: "पहले से रजिस्टर हैं? साइन इन करें",
    noAccount: "नए हैं? रजिस्टर करें",
    errFill: "कृपया सभी खाने भरें।",
    errPhone: "सही 10 अंकों का मोबाइल नंबर डालें।",
    errPin: "पिन ठीक 4 अंकों का होना चाहिए।",
    errNoUser: "इस नंबर पर कोई खाता नहीं मिला। पहले रजिस्टर करें।",
    errWrongPin: "गलत पिन। फिर कोशिश करें।",
    okRegister: "खाता बन गया। स्वागत है!",
    okLogin: "फिर से स्वागत है!",
  },
  gu: {
    welcome: "કેર કનેક્ટમાં આપનું સ્વાગત છે",
    welcomeSub: "તમારા મોબાઇલ નંબરથી એક વાર રજિસ્ટર કરો. તમારી આશા કાર્યકર મદદ કરી શકે છે.",
    register: "રજિસ્ટર કરો",
    login: "સાઇન ઇન",
    name: "પૂરું નામ",
    namePh: "જેમ કે રેખા કુમારી",
    phone: "મોબાઇલ નંબર",
    phonePh: "10 અંકનો મોબાઇલ નંબર",
    village: "ગામ",
    villagePh: "જેમ કે અરંડોલ, જૂનાગઢ",
    langLabel: "પસંદગીની ભાષા",
    pin: "4 અંકનો પિન",
    pinPh: "યાદ રહે એવો પિન પસંદ કરો",
    createBtn: "મારું ખાતું બનાવો",
    loginBtn: "સાઇન ઇન કરો",
    haveAccount: "પહેલેથી રજિસ્ટર છો? સાઇન ઇન કરો",
    noAccount: "નવા છો? રજિસ્ટર કરો",
    errFill: "કૃપા કરી બધા ખાના ભરો.",
    errPhone: "સાચો 10 અંકનો મોબાઇલ નંબર નાખો.",
    errPin: "પિન ચોક્કસ 4 અંકનો હોવો જોઈએ.",
    errNoUser: "આ નંબર પર કોઈ ખાતું મળ્યું નહીં. પહેલા રજિસ્ટર કરો.",
    errWrongPin: "ખોટો પિન. ફરી પ્રયાસ કરો.",
    okRegister: "ખાતું બની ગયું. સ્વાગત છે!",
    okLogin: "ફરી સ્વાગત છે!",
  },
  mr: {
    welcome: "केअर कनेक्टमध्ये तुमचे स्वागत आहे",
    welcomeSub: "तुमच्या मोबाईल नंबरने एकदाच नोंदणी करा. तुमची आशा कार्यकर्ती मदत करू शकते.",
    register: "नोंदणी करा",
    login: "साइन इन",
    name: "पूर्ण नाव",
    namePh: "उदा. रेखा कुमारी",
    phone: "मोबाईल नंबर",
    phonePh: "10 अंकी मोबाईल नंबर",
    village: "गाव",
    villagePh: "उदा. अरंडोल, जुनागढ",
    langLabel: "आवडती भाषा",
    pin: "4 अंकी पिन",
    pinPh: "लक्षात राहील असा पिन निवडा",
    createBtn: "माझे खाते तयार करा",
    loginBtn: "साइन इन करा",
    haveAccount: "आधीच नोंदणी आहे? साइन इन करा",
    noAccount: "नवीन आहात? नोंदणी करा",
    errFill: "कृपया सर्व रकाने भरा.",
    errPhone: "योग्य 10 अंकी मोबाईल नंबर टाका.",
    errPin: "पिन नेमका 4 अंकी असावा.",
    errNoUser: "या नंबरवर खाते सापडले नाही. आधी नोंदणी करा.",
    errWrongPin: "चुकीचा पिन. पुन्हा प्रयत्न करा.",
    okRegister: "खाते तयार झाले. स्वागत आहे!",
    okLogin: "पुन्हा स्वागत आहे!",
  },
  bn: {
    welcome: "কেয়ার কানেক্টে আপনাকে স্বাগতম",
    welcomeSub: "আপনার মোবাইল নম্বর দিয়ে একবার নিবন্ধন করুন। আপনার আশা কর্মী সাহায্য করতে পারেন।",
    register: "নিবন্ধন",
    login: "সাইন ইন",
    name: "পুরো নাম",
    namePh: "যেমন রেখা কুমারী",
    phone: "মোবাইল নম্বর",
    phonePh: "১০ সংখ্যার মোবাইল নম্বর",
    village: "গ্রাম",
    villagePh: "যেমন অরন্ডোল, জুনাগড়",
    langLabel: "পছন্দের ভাষা",
    pin: "৪ সংখ্যার পিন",
    pinPh: "মনে থাকে এমন পিন বাছুন",
    createBtn: "আমার অ্যাকাউন্ট বানান",
    loginBtn: "সাইন ইন করুন",
    haveAccount: "আগেই নিবন্ধিত? সাইন ইন করুন",
    noAccount: "নতুন? নিবন্ধন করুন",
    errFill: "অনুগ্রহ করে সব ঘর পূরণ করুন।",
    errPhone: "সঠিক ১০ সংখ্যার মোবাইল নম্বর দিন।",
    errPin: "পিন ঠিক ৪ সংখ্যার হতে হবে।",
    errNoUser: "এই নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি। আগে নিবন্ধন করুন।",
    errWrongPin: "ভুল পিন। আবার চেষ্টা করুন।",
    okRegister: "অ্যাকাউন্ট তৈরি হয়েছে। স্বাগতম!",
    okLogin: "আবার স্বাগতম!",
  },
};

function AuthPage() {
  const navigate = useNavigate();
  const { lang, setLang, t } = useI18n();
  const a = authText[lang];
  const [mode, setMode] = useState<"register" | "login">("register");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [village, setVillage] = useState("");
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (getStoredUser()) navigate({ to: "/", replace: true });
  }, [navigate]);

  function handleRegister() {
    if (!name.trim() || !village.trim() || !phone.trim() || !pin.trim()) {
      toast.error(a.errFill);
      return;
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      toast.error(a.errPhone);
      return;
    }
    if (!/^\d{4}$/.test(pin.trim())) {
      toast.error(a.errPin);
      return;
    }
    const user: CCUser = {
      name: name.trim(),
      phone: phone.trim(),
      village: village.trim(),
      pin: pin.trim(),
      lang,
    };
    storeUser(user);
    toast.success(a.okRegister);
    navigate({ to: "/" });
  }

  function handleLogin() {
    const saved = getStoredUser();
    if (!saved || saved.phone !== phone.trim()) {
      toast.error(a.errNoUser);
      return;
    }
    if (saved.pin !== pin.trim()) {
      toast.error(a.errWrongPin);
      return;
    }
    toast.success(a.okLogin);
    navigate({ to: "/" });
  }

  const inputCls =
    "w-full rounded-xl ring-1 ring-black/10 bg-paper/60 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pine";

  return (
    <div className="min-h-screen bg-paper text-ink font-sans antialiased flex flex-col">
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
          <label className="flex items-center gap-2 text-xs text-cream/80">
            <span className="hidden sm:inline">{t("language")}</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              className="rounded-lg bg-cream/15 text-cream px-2 py-1.5 text-xs outline-none ring-1 ring-cream/25 [&>option]:text-ink"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <main className="flex-1 grid place-items-center px-5 py-10">
        <div className="w-full max-w-md">
          <h1 className="font-display font-medium text-2xl sm:text-3xl text-center">{a.welcome}</h1>
          <p className="text-ink/65 text-sm text-center mt-2 text-pretty">{a.welcomeSub}</p>

          <div className="mt-6 grid grid-cols-2 rounded-xl bg-cream ring-1 ring-black/5 p-1 text-sm font-medium">
            <button
              type="button"
              onClick={() => setMode("register")}
              aria-pressed={mode === "register"}
              className={`py-2.5 rounded-lg ${
                mode === "register" ? "bg-pine text-cream" : "text-ink/70 hover:text-ink"
              }`}
            >
              {a.register}
            </button>
            <button
              type="button"
              onClick={() => setMode("login")}
              aria-pressed={mode === "login"}
              className={`py-2.5 rounded-lg ${
                mode === "login" ? "bg-pine text-cream" : "text-ink/70 hover:text-ink"
              }`}
            >
              {a.login}
            </button>
          </div>

          <form
            className="mt-4 bg-cream rounded-2xl ring-1 ring-black/5 p-5 sm:p-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              mode === "register" ? handleRegister() : handleLogin();
            }}
          >
            {mode === "register" && (
              <>
                <div>
                  <label htmlFor="name" className="text-xs font-medium text-ink/70">
                    {a.name}
                  </label>
                  <input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={a.namePh}
                    className={`${inputCls} mt-1`}
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label htmlFor="village" className="text-xs font-medium text-ink/70">
                    {a.village}
                  </label>
                  <input
                    id="village"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder={a.villagePh}
                    className={`${inputCls} mt-1`}
                  />
                </div>
                <div>
                  <label htmlFor="pref-lang" className="text-xs font-medium text-ink/70">
                    {a.langLabel}
                  </label>
                  <select
                    id="pref-lang"
                    value={lang}
                    onChange={(e) => setLang(e.target.value as Lang)}
                    className={`${inputCls} mt-1`}
                  >
                    {languages.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <div>
              <label htmlFor="phone" className="text-xs font-medium text-ink/70">
                {a.phone}
              </label>
              <input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder={a.phonePh}
                inputMode="numeric"
                autoComplete="tel"
                className={`${inputCls} mt-1`}
              />
            </div>
            <div>
              <label htmlFor="pin" className="text-xs font-medium text-ink/70">
                {a.pin}
              </label>
              <input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder={a.pinPh}
                inputMode="numeric"
                className={`${inputCls} mt-1`}
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-pine text-cream font-semibold text-sm hover:opacity-90"
            >
              {mode === "register" ? a.createBtn : a.loginBtn}
            </button>
            <button
              type="button"
              onClick={() => setMode(mode === "register" ? "login" : "register")}
              className="w-full text-center text-xs font-medium text-pine underline underline-offset-2"
            >
              {mode === "register" ? a.haveAccount : a.noAccount}
            </button>
          </form>
        </div>
      </main>

      <footer className="bg-pine text-cream/70">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 text-center text-xs">
          <p>{t("footer2")}</p>
        </div>
      </footer>
    </div>
  );
}
