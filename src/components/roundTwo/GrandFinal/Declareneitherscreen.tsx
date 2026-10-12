"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DeclareNeitherScreen() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showBody, setShowBody] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Staggered entrance animation
    const t1 = setTimeout(() => setVisible(true), 100);
    const t2 = setTimeout(() => setShowSubtitle(true), 700);
    const t3 = setTimeout(() => setShowBody(true), 1200);
    const t4 = setTimeout(() => setShowButton(true), 1800);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        
        transition-opacity duration-700
        ${visible ? "opacity-100" : "opacity-0"}
      `}
    >
      {/* Background texture — subtle radial grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 40%, rgba(220,38,38,0.06) 0%, transparent 65%),
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 48px 48px, 48px 48px",
        }}
      />

      {/* Decorative corner marks */}
      {/* <span className="absolute top-6 left-6 text-neutral-800 text-xs font-mono tracking-widest select-none">
        ◻ SESSION END
      </span>
      <span className="absolute top-6 right-6 text-neutral-800 text-xs font-mono tracking-widest select-none">
        NO WINNER ◻
      </span>
      <span className="absolute bottom-6 left-6 text-neutral-800 text-xs font-mono tracking-widest select-none">
        ROUND CONCLUDED
      </span>
      <span className="absolute bottom-6 right-6 text-neutral-800 text-xs font-mono tracking-widest select-none">
        HOST DECISION ◻
      </span> */}

      {/* Main card */}
      <div className="relative z-10 w-full max-w-lg mx-4 text-center flex mt-8 flex-col items-center gap-0">
        {/* Icon block */}
        <div
          className={`
            mb-8 transition-all duration-700
            ${visible ? "scale-100 opacity-100" : "scale-75 opacity-0"}
          `}
        >
          {/* Outer ring */}
          <div
            className="relative w-28 h-28 rounded-full flex items-center justify-center mx-auto"
            style={{
              border: "1px solid rgba(220,38,38,0.25)",
              boxShadow:
                "0 0 48px rgba(220,38,38,0.08), inset 0 0 24px rgba(0,0,0,0.4)",
            }}
          >
            {/* Inner ring */}
            <div
              className="absolute inset-2 rounded-full"
              style={{ border: "1px solid rgba(220,38,38,0.15)" }}
            />
            {/* Icon */}
            <span className="text-5xl relative z-10 select-none">🚫</span>
          </div>

          {/* Pulsing ring animation */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full animate-ping opacity-10"
            style={{ border: "1px solid rgb(220,38,38)" }}
          />
        </div>

        {/* Headline */}
        <h1
          className={`
            text-4xl sm:text-5xl font-black tracking-[0.12em] uppercase text-white
            transition-all duration-700 delay-100
            ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}
          `}
          style={{ letterSpacing: "0.14em" }}
        >
          No Winner
        </h1>

        {/* Divider */}
        <div
          className={`
            flex items-center gap-3 my-5
            transition-all duration-700
            ${visible ? "opacity-100" : "opacity-0"}
          `}
        >
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-red-700/60" />
          <div className="w-1 h-1 rounded-full bg-red-600" />
          <span className="text-red-500 text-[10px] font-black tracking-[0.4em] uppercase">
            Declared
          </span>
          <div className="w-1 h-1 rounded-full bg-red-600" />
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-red-700/60" />
        </div>

        {/* Subtitle */}
        <p
          className={`
            text-neutral-400 text-sm tracking-[0.25em] uppercase font-semibold mb-8
            transition-all duration-700
            ${showSubtitle ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
          `}
        >
          The Host has ended this round
        </p>

        {/* Body card */}
        <div
          className={`
            w-full rounded-2xl border border-white/8 bg-white/[0.03] p-6 mb-8
            transition-all duration-700
            ${showBody ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}
          `}
        >
          <p className="text-neutral-300 text-sm leading-relaxed mb-4">
            After careful consideration, the host has decided that{" "}
            <span className="text-white font-bold">no contestant</span> will be
            declared the winner of this round.
          </p>
          <p className="text-neutral-500 text-xs leading-relaxed">
            This decision is final. No points have been awarded, and no
            elimination has taken place. The round has been closed without a
            declared winner.
          </p>

          {/* Horizontal rule */}
          <div className="my-5 h-px bg-white/8" />

          {/* Info row */}
          <div className="flex items-center justify-center gap-8 text-center">
            <div>
              <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-mono mb-1">
                Winner
              </p>
              <p className="text-sm font-black text-red-500 tracking-widest uppercase">
                None
              </p>
            </div>
            {/* <div className="w-px h-8 bg-white/10" /> */}
            {/* <div>
              <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-mono mb-1">
                Points Awarded
              </p>
              <p className="text-sm font-black text-neutral-400 tracking-widest">
                0
              </p>
            </div> */}
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-mono mb-1">
                Status
              </p>
              <p className="text-sm font-black text-orange-500 tracking-widest uppercase">
                Closed
              </p>
            </div>
          </div>
        </div>

        {/* CTA button */}
        <div
          className={`
            w-full transition-all duration-700
            ${showButton ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
          `}
        >
          <button
            onClick={() => router.push("/")}
            className="
              w-full py-4 rounded-xl border border-white/15
              text-xs font-black tracking-[0.3em] uppercase text-white/80
              hover:bg-white/5 hover:border-white/25 hover:text-white
              transition-all duration-300 cursor-pointer
            "
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
