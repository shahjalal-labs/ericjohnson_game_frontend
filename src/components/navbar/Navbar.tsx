"use client";

import logo from "@/assets/update_logo.png";
import user from "@/assets/user.png";
import { Button } from "@/components/ui/button";
import { useGetMyProfileQuery } from "@/redux/api/userApi";

import { AnimatePresence, motion } from "framer-motion";
import Cookies from "js-cookie";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: myProfileData } = useGetMyProfileQuery({});
  const profileData = myProfileData?.result;
  const token = Cookies.get("accessToken");
  const pathname = usePathname();
  const router = useRouter();

  // Handle message navigation with token check
  const handleMessageClick = (e: React.MouseEvent) => {
    if (!token) {
      e.preventDefault();
      router.push("/login");
      return;
    }
    // If token exists, navigate to message page
    router.push("/message");
  };

  // Handle mobile message click
  const handleMobileMessageClick = (e: React.MouseEvent) => {
    if (!token) {
      e.preventDefault();
      setIsMobileMenuOpen(false);
      router.push("/login");
      return;
    }
    setIsMobileMenuOpen(false);
    router.push("/message");
  };

  return (
    <div>
      <nav className="relative z-50 py-6">
        <div className="container mx-auto px-4">
          <div className="bg-black/80 backdrop-blur-md rounded-full shadow-[0_0_15px_rgba(251,191,36,0.15)] border border-amber-500/30 px-6 py-4 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src={logo}
                alt="Logo"
                className="w-10 h-10 object-contain filter drop-shadow-[0_0_8px_rgba(251,191,36,0.4)] transition-transform group-hover:scale-105"
              />
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-orange-700 leading-none tracking-widest uppercase mb-0.5">
                  INTERNET
                </span>
                <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-orange-700 leading-none tracking-widest uppercase">
                  BACHELOR
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/games"
                className={`flex items-center gap-1 ${pathname === "/games"
                    ? "text-amber-400 font-semibold"
                    : "text-amber-100/70 hover:text-amber-400 transition-colors"
                  }`}
              >
                Games
              </Link>

              <button
                onClick={handleMessageClick}
                className="text-amber-100/70 hover:text-amber-400 transition-colors cursor-pointer bg-transparent border-none font-inherit"
              >
                Message
              </button>
              <Link
                href="/buy-tokens"
                className={`text-amber-100/70 hover:text-amber-400 transition-colors cursor-pointer bg-transparent border-none font-inherit ${pathname === "/buy-tokens"
                    ? "text-amber-400 font-semibold"
                    : "text-amber-100/70 hover:text-amber-400 transition-colors"
                  }`}


              >
                Tokens
              </Link>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {token ? (
                <>
                  <div></div>
                  <Link href="/my-profile">
                    <Image
                      src={profileData?.profileImage || user}
                      alt="User Profile"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full border-2 border-amber-400 object-cover"
                    />
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/signup">
                    <Button
                      variant="outline"
                      className="rounded-full px-6 py-3 h-auto border border-amber-500/50 text-amber-100 font-semibold hover:border-amber-400 hover:text-amber-400 transition-all bg-transparent"
                    >
                      Create an Account
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button className="rounded-full px-6 py-3 h-auto bg-gradient-to-r from-yellow-400 to-orange-600 hover:from-yellow-300 hover:to-orange-500 text-black font-bold shadow-[0_0_15px_rgba(251,191,36,0.4)] flex items-center gap-2 transition-all border-none">
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex flex-col gap-1.5 p-2"
            >
              <span
                className={`w-6 h-0.5 bg-amber-400 rounded transition-all ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
                  }`}
              />
              <span
                className={`w-6 h-0.5 bg-amber-400 rounded transition-all ${isMobileMenuOpen ? "opacity-0" : ""
                  }`}
              />
              <span
                className={`w-6 h-0.5 bg-amber-400 rounded transition-all ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
              />
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="md:hidden mt-4 bg-[#1A0500] border border-amber-500/30 rounded-3xl shadow-[0_0_20px_rgba(251,191,36,0.15)] p-6 space-y-4 backdrop-blur-md"
              >
                <button
                  onClick={handleMobileMessageClick}
                  className="block w-full text-left text-amber-100/80 hover:text-amber-400 transition-colors cursor-pointer bg-transparent border-none font-inherit"
                >
                  Message
                </button>

                <div className="pt-4 border-t border-amber-500/20 space-y-3">
                  {token ? (
                    <Link
                      href="/my-profile"
                      className="flex items-center gap-3 text-amber-100/80 hover:text-amber-400 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Image
                        src={profileData?.profileImage || user}
                        alt="User Profile"
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full border-2 border-amber-400 object-cover"
                      />
                      <span className="font-semibold">My Profile</span>
                    </Link>
                  ) : (
                    <>
                      <Link href="/signup" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button
                          variant="outline"
                          className="w-full rounded-full border border-amber-500/50 text-amber-100 font-semibold hover:border-amber-400 hover:text-amber-400 transition-all bg-transparent"
                        >
                          Create an Account
                        </Button>
                      </Link>
                      <Link href="/login" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-600 hover:from-yellow-300 hover:to-orange-500 text-black font-bold shadow-[0_0_15px_rgba(251,191,36,0.4)] flex items-center justify-center gap-2 border-none">
                          Sign In
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;