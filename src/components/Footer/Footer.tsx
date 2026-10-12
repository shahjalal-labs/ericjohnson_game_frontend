import logo from "@/assets/update_logo.png";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Footer() {
  const router = useRouter();


  const handleNavigation = (path: string) => {
    const token = Cookies.get("accessToken");

    if (path === "/start-game") {
      if (!token) {
        router.push("/login");
        return;
      }

      router.push(`/start-game?x-token=${encodeURIComponent(token)}`);
      return;
    }

    router.push(path);
  };

  return (
    <footer className="relative w-full bg-black border-t border-amber-500/20 font-serif overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1A0500] to-black opacity-80 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-32 bg-amber-500/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 container mx-auto px-4 max-w-6xl">
          {/* Left section - Brand */}
          <div className="space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <Image
                src={logo}
                alt="Internet Bachelor Logo"
                className="w-14 h-14 object-contain filter drop-shadow-[0_0_10px_rgba(251,191,36,0.4)] transition-transform duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(251,191,36,0.7)]"
              />
              <div className="flex flex-col text-left">
                <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-orange-700 leading-none tracking-[0.2em] uppercase mb-1">
                  INTERNET
                </span>
                <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-orange-700 leading-none tracking-[0.2em] uppercase">
                  BACHELOR
                </span>
              </div>
            </Link>

            <p className="text-amber-100/60 leading-relaxed max-w-sm text-sm sm:text-base italic">
              Experience the ultimate journey of connection and romance. Find your perfect match in our premium dating adventure.
            </p>
          </div>

          {/* Right section - Quick Links */}
          <div className="flex flex-col items-center md:items-end">
            <div className="text-center md:text-right w-full">
              <h4 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-500 mb-8 uppercase tracking-[0.2em]">
                Quick Links
              </h4>
              <ul className="space-y-5">
                <li>
                  <button
                    onClick={() => handleNavigation("/start-game")}
                    className="text-amber-100/60 hover:text-amber-400 transition-colors duration-300 text-sm sm:text-base font-bold uppercase tracking-widest flex items-center justify-center md:justify-end gap-3 group w-full cursor-pointer"
                  >
                    <span className="md:hidden opacity-0 group-hover:opacity-100 transition-all transform scale-50 group-hover:scale-100 text-amber-400">🌹</span>
                    Start Game
                    <span className="hidden md:inline-block opacity-0 group-hover:opacity-100 transition-all transform scale-50 group-hover:scale-100 text-amber-400">🌹</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("/buy-tokens")}
                    className="text-amber-100/60 hover:text-amber-400 transition-colors duration-300 text-sm sm:text-base font-bold uppercase tracking-widest flex items-center justify-center md:justify-end gap-3 group w-full cursor-pointer"
                  >
                    <span className="md:hidden opacity-0 group-hover:opacity-100 transition-all transform scale-50 group-hover:scale-100 text-amber-400">🌹</span>
                    Premium Passes
                    <span className="hidden md:inline-block opacity-0 group-hover:opacity-100 transition-all transform scale-50 group-hover:scale-100 text-amber-400">🌹</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/40 to-transparent my-8"></div>
        </div>

        {/* Copyright */}
        <div className="container mx-auto px-4 text-center text-amber-100/40 text-xs sm:text-sm tracking-[0.2em] uppercase font-semibold flex flex-col items-center gap-3">
          <p>© {new Date().getFullYear()} Internet Bachelor. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}