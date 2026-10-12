"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Zap, Sparkles } from 'lucide-react';

function Games() {
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        // Set the date we're counting down to
        const countDownDate = new Date("Aug 27, 2026 00:00:00").getTime();

        // Update the countdown every 1 second
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = countDownDate - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft({ hours, minutes, seconds });
        }, 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-screen w-full flex flex-col justify-center items-center relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-3xl" />
            </div>

            {/* Grid Pattern - Fixed SVG Data URL */}
            <div
                className="absolute inset-0 opacity-50"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            />

            <div className="relative z-10 text-center">
                {/* Coming Soon Text */}
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-8"
                >
                    <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-gradient-to-r from-yellow-400/10 to-orange-500/10 border border-yellow-400/20 backdrop-blur-sm mb-6">
                        <Gamepad2 className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-400/90 text-sm font-medium">More Games</span>
                    </div>

                    <h1 className="sm:text-9xl text-7xl font-extrabold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent animate-pulse">
                        Coming
                    </h1>
                    <h1 className="sm:text-7xl text-5xl font-extrabold text-white/90 mt-4">
                        Soon
                    </h1>
                </motion.div>



                {/* Decorative Shapes */}
                <div className="absolute top-20 left-10 opacity-20 hidden sm:block">
                    <div className="w-20 h-20 border-4 border-yellow-400/30 rounded-full animate-spin-slow" />
                </div>
                <div className="absolute bottom-20 right-10 opacity-20 hidden sm:block">
                    <div className="w-16 h-16 border-4 border-orange-400/30 rounded-full animate-spin-slow-reverse" />
                </div>
            </div>
        </div>
    );
}

export default Games;