import { useEffect, useState } from "react";
import HeaderLogo from "@/components/layout/HeaderLogo";

const ComingSoon = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden bg-primary text-white">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-accent/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[520px] w-[520px] rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(6,16,67,0.4),rgba(6,16,67,0.85))]" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <div
          className={`mb-10 transition-all duration-700 ${
            show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
          }`}
        >
          <div className="rounded-2xl bg-white/95 px-6 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
            <HeaderLogo className="block h-10 w-auto sm:h-12" />
          </div>
        </div>

        <span
          className={`mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm transition-all duration-700 delay-100 ${
            show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
          Launching Soon
        </span>

        <h1
          className={`mb-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl transition-all duration-700 delay-200 ${
            show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          We're <span className="text-accent">Coming Soon</span>
        </h1>

        <p
          className={`mx-auto mb-10 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg transition-all duration-700 delay-300 ${
            show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Something powerful is on the way. RAC Logistics is putting the final
          touches on a smarter way to ship across the globe. Stay tuned.
        </p>

        <div
          className={`flex flex-col items-center gap-3 text-sm text-white/70 transition-all duration-700 delay-500 ${
            show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <a
            href="mailto:info@raclogisticltd.com"
            className="font-semibold text-white underline-offset-4 transition hover:text-accent hover:underline"
          >
            info@raclogisticltd.com
          </a>
          <span className="text-xs uppercase tracking-[0.25em] text-white/50">
            Global Shipping. Delivered With Excellence.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
