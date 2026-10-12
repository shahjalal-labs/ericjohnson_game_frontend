"use client";

import heroImage1 from "@/assets/heroImages/heroIn1.png";
import heroImage2 from "@/assets/heroImages/heroIn2.png";
import heroImage3 from "@/assets/heroImages/heroIn3.png";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const heroSlides = [
  {
    id: 1,
    title: "FIND REAL\nCONNECTIONS",
    description:
      "No more endless swipes with no fulfillment. Become the coveted target of affection in the new Internet Bachelor dating game!",
    image: heroImage1,
    accent: "#f59e0b",
    glow: "rgba(245,158,11,0.35)",
    gradientFrom: "#f59e0b",
    gradientTo: "#ef4444",
  },
  {
    id: 2,
    title: "SHOW YOUR\nWORTH",
    description:
      "Narrow down a field of 8 potential suitors to get to your one perfect match through a series of questions, pictures, and even a video call. OR, prove your worth in the dating market by entering as a contestant!",
    image: heroImage2,
    accent: "#ec4899",
    glow: "rgba(236,72,153,0.35)",
    gradientFrom: "#ec4899",
    gradientTo: "#a855f7",
  },
  {
    id: 3,
    title: "EARN\nPOINTS",
    description:
      "Playing games earns points, getting you closer to being able to become the Internet Bachelor yourself. Opportunity awaits. Enter now!",
    image: heroImage3,
    accent: "#a855f7",
    glow: "rgba(168,85,247,0.35)",
    gradientFrom: "#a855f7",
    gradientTo: "#3b82f6",
  },
];

const SLIDE_DURATION = 8000;

const textVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? 60 : -60,
    filter: "blur(6px)",
  }),
  center: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -60 : 60,
    filter: "blur(6px)",
    transition: { duration: 0.4, ease: [0.55, 0.06, 0.68, 0.19] as const },
  }),
};

const imageVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? 120 : -120,
    scale: 0.9,
    rotateY: dir > 0 ? 15 : -15,
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    rotateY: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -80 : 80,
    scale: 0.92,
    rotateY: dir > 0 ? -10 : 10,
    transition: { duration: 0.45, ease: [0.55, 0.06, 0.68, 0.19] as const },
  }),
};

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  const startTimers = (slideIndex: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(0);
    const step = 100 / (SLIDE_DURATION / 50);
    let p = 0;
    progressRef.current = setInterval(() => {
      p += step;
      if (p >= 100) p = 100;
      setProgress(p);
    }, 50);
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => {
        const next = (prev + 1) % heroSlides.length;
        startTimers(next);
        return next;
      });
    }, SLIDE_DURATION);
  };

  useEffect(() => {
    startTimers(0);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
    startTimers(index);
  };

  const slide = heroSlides[currentSlide];

  const ProgressBars = () => (
    <div className="hero-nav">
      {heroSlides.map((s, i) => (
        <button
          key={s.id}
          onClick={() => goToSlide(i)}
          className="hero-nav-item"
          aria-label={`Go to slide ${i + 1}`}
        >
          <div
            className="hero-nav-track"
            style={{
              borderColor:
                i === currentSlide ? slide.accent : "rgba(255,255,255,0.2)",
            }}
          >
            <motion.div
              className="hero-nav-fill"
              style={{
                background: `linear-gradient(90deg, ${slide.gradientFrom}, ${slide.gradientTo})`,
                width:
                  i === currentSlide
                    ? `${progress}%`
                    : i < currentSlide
                      ? "100%"
                      : "0%",
              }}
            />
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <section className="hero-section">
      {/* Animated background blobs */}
      <motion.div
        className="hero-blob hero-blob-1"
        animate={{ background: slide.glow }}
        transition={{ duration: 1.2 }}
      />
      <motion.div
        className="hero-blob hero-blob-2"
        animate={{ background: heroSlides[(currentSlide + 1) % 3].glow }}
        transition={{ duration: 1.2 }}
      />

      <div className="hero-container">
        <div className="hero-inner">
          {/* -- TEXT COLUMN -- */}
          <div className="hero-text-col">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`text-${currentSlide}`}
                custom={direction}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="hero-text-content"
              >
                <h1
                  className="hero-title"
                  style={{
                    backgroundImage: `linear-gradient(135deg, #fff 0%, ${slide.gradientFrom} 45%, ${slide.gradientTo} 100%)`,
                  }}
                >
                  {slide.title.split("\n").map((line, i) => (
                    <span key={i} className="hero-title-line">
                      {line}
                    </span>
                  ))}
                </h1>

                {/* Accent bar */}
                <div
                  className="hero-divider"
                  style={{
                    background: `linear-gradient(90deg, ${slide.gradientFrom}, ${slide.gradientTo})`,
                  }}
                />

                {/* Description */}
                <p className="hero-description">{slide.description}</p>

                {/* CTAs */}
                <div className="hero-cta-row">
                  <button
                    onClick={() => {
                      const token = Cookies.get("accessToken");
                      if (!token) {
                        // Redirect to login page if no token
                        router.push("/login");
                        return;
                      }
                      // Redirect to start-game with token
                      router.push(`/start-game?x-token=${encodeURIComponent(token)}`);
                    }}
                    className="hero-btn-primary"
                    style={{
                      background: `linear-gradient(135deg, ${slide.gradientFrom}, ${slide.gradientTo})`,
                      boxShadow: `0 0 28px ${slide.glow}, 0 4px 16px rgba(0,0,0,0.4)`,
                    }}
                  >
                    Play Now
                  </button>
                  {/* <button
                    className="hero-btn-ghost"
                    style={{
                      borderColor: `${slide.accent}50`,
                      color: slide.accent,
                    }}
                  >
                    Learn More
                  </button> */}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress bars — desktop (below text) */}
            <div className="hero-nav-desktop">
              <ProgressBars />
            </div>
          </div>

          {/* -- IMAGE COLUMN -- */}
          <div className="hero-image-col">
            {/* Glow halo */}
            <motion.div
              className="hero-image-glow"
              animate={{ background: slide.glow }}
              transition={{ duration: 1.2 }}
            />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`img-${currentSlide}`}
                custom={direction}
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="hero-image-frame"
                style={{ perspective: 1000 }}
              >
                {/* Glass card */}
                <div
                  className="hero-glass-card"
                  style={{
                    borderColor: `${slide.accent}40`,
                    boxShadow: `0 0 60px ${slide.glow}, 0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12)`,
                  }}
                >
                  <div className="hero-image-wrapper">
                    <img
                      src={slide.image.src}
                      alt={slide.title}
                      className="hero-image"
                    />
                    {/* gradient overlay on image */}
                    <div
                      className="hero-image-overlay"
                      style={{
                        background: `linear-gradient(to top, ${slide.gradientTo}44 0%, transparent 60%)`,
                      }}
                    />
                  </div>

                  {/* Gradient strip */}
                  <div
                    className="hero-image-strip"
                    style={{
                      background: `linear-gradient(90deg, ${slide.gradientFrom}cc, ${slide.gradientTo}cc)`,
                    }}
                  >
                    <span className="hero-strip-dot" />
                    <span className="hero-strip-label">Internet Bachelor</span>
                    <span className="hero-strip-badge">LIVE</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress bars — mobile (below image) */}
            <div className="hero-nav-mobile">
              <ProgressBars />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-section {
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          padding: 100px 0 100px;
        }
        .hero-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(130px);
          pointer-events: none;
        }
        .hero-blob-1 { width: 650px; height: 650px; top: -150px; left: -200px; opacity: 0.55; }
        .hero-blob-2 { width: 550px; height: 550px; bottom: -100px; right: -120px; opacity: 0.45; }

        .hero-container {
          position: relative; z-index: 10;
          width: 100%; max-width: 1280px;
          margin: 0 auto; padding: 0 4px;
        }

        .hero-inner {
          display: flex;
          align-items: center;
          gap: 72px;
        }

        /* -- TEXT -- */
        .hero-text-col { flex: 1; min-width: 0; }
        .hero-text-content { display: flex; flex-direction: column; }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase;
          padding: 5px 14px; border: 1px solid; border-radius: 999px; margin-bottom: 22px;
          background: rgba(255,255,255,0.04); backdrop-filter: blur(10px);
          width: fit-content;
        }
        .hero-badge-dot {
          width: 7px; height: 7px; border-radius: 50%;
          animation: hpulse 2s infinite;
        }
        @keyframes hpulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.4; transform:scale(1.5); }
        }

        .hero-title {
          font-size: clamp(2.4rem, 5.5vw, 4.2rem);
          font-weight: 900; line-height: 1.0;
          letter-spacing: -0.025em; text-transform: uppercase;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 18px;
        }
        .hero-title-line { display: block; }

        .hero-divider {
          height: 4px; width: 72px; border-radius: 4px;
          margin-bottom: 22px;
        }

        .hero-description {
          font-size: 1rem; line-height: 1.8;
          color: rgba(255,255,255,0.65);
          margin-bottom: 34px; max-width: 480px;
        }

        .hero-cta-row {
          display: flex; align-items: center;
          gap: 14px; margin-bottom: 36px; flex-wrap: wrap;
        }
        .hero-btn-primary {
          padding: 13px 34px; border-radius: 12px;
          font-weight: 800; font-size: 0.88rem; letter-spacing: 1.2px; text-transform: uppercase;
          color: #0a0a0a; border: none; cursor: pointer;
          transition: transform 0.22s, box-shadow 0.22s, filter 0.22s;
        }
        .hero-btn-primary:hover {
          transform: translateY(-3px) scale(1.04);
          filter: brightness(1.1);
        }
        .hero-btn-ghost {
          padding: 13px 28px; border-radius: 12px;
          font-weight: 600; font-size: 0.88rem; letter-spacing: 1px; text-transform: uppercase;
          background: rgba(255,255,255,0.05);
          border: 1px solid; cursor: pointer; backdrop-filter: blur(8px);
          transition: background 0.22s, transform 0.22s;
        }
        .hero-btn-ghost:hover {
          background: rgba(255,255,255,0.1);
          transform: translateY(-2px);
        }

        /* -- NAV BARS -- */
        .hero-nav { display: flex; gap: 10px; align-items: center; }
        .hero-nav-item { background: none; border: none; padding: 6px 0; cursor: pointer; }
        .hero-nav-track {
          width: 60px; height: 5px; border-radius: 3px;
          border: 1px solid; background: rgba(255,255,255,0.08);
          overflow: hidden; transition: border-color 0.3s;
        }
        .hero-nav-fill { height: 100%; border-radius: 3px; transition: width 0.05s linear; }

        /* desktop → shown below text, hidden on mobile */
        .hero-nav-desktop { display: block; }
        /* mobile → hidden on desktop */
        .hero-nav-mobile { display: none; }

        /* -- IMAGE -- */
        .hero-image-col {
          flex: 1.1; min-width: 0;
          position: relative; display: flex;
          flex-direction: column; align-items: center;
          gap: 20px;
        }
        .hero-image-glow {
          position: absolute; inset: -40px;
          border-radius: 50%; filter: blur(90px);
          pointer-events: none; z-index: 0;
        }
        .hero-image-frame {
          position: relative; width: 100%;
          max-width: 580px; z-index: 1;
        }
        .hero-glass-card {
          border-radius: 28px; border: 1px solid;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(12px); overflow: hidden;
        }
        .hero-image-wrapper { position: relative; width: 100%; height: 480px; overflow: hidden; }
        .hero-image {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
        }
        .hero-image-overlay {
          position: absolute; inset: 0;
          pointer-events: none;
        }
        .hero-image-strip {
          display: flex; align-items: center;
          gap: 10px; padding: 13px 20px;
          backdrop-filter: blur(12px);
        }
        .hero-strip-dot {
          width: 9px; height: 9px; border-radius: 50%;
          background: rgba(255,255,255,0.9);
          flex-shrink: 0; animation: hpulse 2s infinite;
        }
        .hero-strip-label {
          font-size: 0.84rem; font-weight: 700;
          color: #fff; letter-spacing: 0.5px; flex: 1;
        }
        .hero-strip-badge {
          font-size: 0.68rem; font-weight: 800;
          letter-spacing: 1.8px; padding: 3px 9px;
          border-radius: 6px; background: rgba(255,255,255,0.2);
          color: #fff; border: 1px solid rgba(255,255,255,0.35);
        }

        /* -- RESPONSIVE -- */
        @media (max-width: 960px) {
          .hero-inner {
            flex-direction: column;
            gap: 36px; text-align: center;
          }
          .hero-text-col {
            display: flex; flex-direction: column; align-items: center;
            order: 1;
          }
          .hero-badge { margin-left: auto; margin-right: auto; }
          .hero-description { max-width: 100%; }

          /* Hide desktop nav, show mobile nav */
          .hero-nav-desktop { display: none; }
          .hero-nav-mobile { display: flex; justify-content: center; margin-top: 4px; }

          .hero-image-col { order: 2; width: 100%; }
          .hero-image-frame { max-width: 480px; margin: 0 auto; }
          .hero-image-wrapper { height: 380px; }
        }
        @media (max-width: 520px) {
          .hero-container { padding: 0 20px; }
          .hero-title { font-size: 2rem; }
          .hero-section { padding: 64px 0 48px; }
          .hero-image-wrapper { height: 280px; }
        }
      `}</style>
    </section>
  );
}
