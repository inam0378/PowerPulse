import { ArrowRight, Tablet, WifiOff } from "lucide-react";
import { buttonClass } from "../ui/Button";

// RestoPulse Tablet is a static offline app in /public/restopulse-tablet, so these are plain links (not Next routes).
const FEATURES = [
  { icon: Tablet, t: "Android tablet & phone", d: "Installs from Chrome, opens from the home screen" },
  { icon: WifiOff, t: "Works fully offline", d: "Internet needed only for the first install" },
  { icon: ArrowRight, t: "Separate from cloud & PC", d: "Its own license, locked to one device" },
];

export function TabletAppBand() {
  return (
    <section id="restopulse-tablet" aria-labelledby="tablet-app-title" className="container-pp scroll-mt-24 pt-10 pb-4">
      <div data-reveal className="relative overflow-hidden rounded-[2rem] border border-[#ffc800]/40 bg-gradient-to-br from-[#1c1606] via-surface to-[#0d1324] px-6 py-10 sm:px-10">
        <div aria-hidden="true" className="absolute -top-20 -right-16 size-72 rounded-full bg-[#ffc800]/15 blur-[100px]" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-md bg-[#ffc800] px-2.5 py-1 text-xs font-bold tracking-wider text-[#0c0b09]">TABLET VERSION</span>
              <span className="rounded-md bg-[#ffc800] px-2.5 py-1 text-xs font-bold tracking-wider text-[#0c0b09]">OFFLINE VERSION</span>
              <span className="rounded-md border border-[#ffc800]/70 px-2.5 py-1 text-xs font-bold tracking-wider text-[#ffc800]">NEW</span>
            </div>
            <h2 id="tablet-app-title" className="mt-4 font-display text-3xl font-semibold text-balance sm:text-4xl">
              RestoPulse Tablet: restaurant POS on your Android tablet, with no internet
            </h2>
            <p className="mt-3 max-w-xl text-text-2">
              Install it once from the website on an Android tablet or phone. After that, billing, kitchen, waiters and sales reports work with WiFi and mobile data switched off.
            </p>
            <p className="mt-4 max-w-xl rounded-xl border border-[#6b4b0c] bg-[#2a1d08] px-4 py-3 text-sm text-[#efe6c8]">
              <b className="text-[#ffc800]">Your data, your responsibility:</b> all data is saved only on the tablet/phone. The shopkeeper alone is responsible for it and for taking backups.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/restopulse-tablet" className={buttonClass("secondary", "lg", "!border-[#ffc800] !bg-[#ffc800] !text-[#0c0b09] hover:!bg-[#ffd633]")}>
                Install RestoPulse Tablet <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a href="/restopulse-tablet/app.html" className={buttonClass("secondary", "lg")}>Open the app</a>
            </div>
          </div>
          <ul className="grid gap-3 text-sm">
            {FEATURES.map((f) => (
              <li key={f.t} className="glass flex items-start gap-3 rounded-2xl p-4">
                <f.icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#ffc800]" />
                <span><b className="block font-semibold text-text">{f.t}</b><span className="text-text-2">{f.d}</span></span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
